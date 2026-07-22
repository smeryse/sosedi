import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { query, withTransaction, type QueryResultRow } from "@/lib/db";

export { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

const SESSION_TOKEN_BYTES = 32;
const SHORT_SESSION_HOURS = 24;
const REMEMBERED_SESSION_DAYS = 30;
const SHORT_IDLE_HOURS = 12;
const REMEMBERED_IDLE_DAYS = 7;
const ROTATION_INTERVAL_HOURS = 12;
const LAST_SEEN_WRITE_INTERVAL_MINUTES = 5;

export const USER_ROLES = ["tenant", "landlord", "admin", "moderator", "partner"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type CurrentUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  roles: UserRole[];
  profileId: string | null;
  onboardingCompleted: boolean;
};

export type CreateSessionOptions = {
  request?: Request;
  rememberMe?: boolean;
};

type CurrentUserRow = QueryResultRow & {
  id: string;
  email: string;
  email_verified: boolean;
  roles: UserRole[];
  profile_id: string | null;
  onboarding_completed: boolean | null;
  session_id: string;
  last_seen_at: Date;
};

type SessionInsertRow = QueryResultRow & {
  id: string;
  expires_at: Date;
};

type RotatedSessionRow = QueryResultRow & {
  expires_at: Date;
};

export class AuthError extends Error {
  readonly status: 401 | 403;
  readonly code: "UNAUTHENTICATED" | "FORBIDDEN";

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.code = status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN";
  }
}

function createOpaqueToken(): string {
  return randomBytes(SESSION_TOKEN_BYTES).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function getClientAddress(request: Request | undefined): string | null {
  if (!request) return null;

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || null;
}

function hashOptionalValue(value: string | null): string | null {
  if (!value) return null;
  return createHash("sha256").update(value, "utf8").digest("hex");
}

async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    priority: "high",
  });
}

async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
    priority: "high",
  });
}

async function readSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return value && value.length <= 128 ? value : null;
}

export async function createSession(
  userId: string,
  options: CreateSessionOptions = {},
): Promise<{ id: string; expiresAt: Date }> {
  const token = createOpaqueToken();
  const tokenHash = hashSessionToken(token);
  const rememberMe = options.rememberMe === true;
  const absoluteLifetime = rememberMe
    ? `${REMEMBERED_SESSION_DAYS} days`
    : `${SHORT_SESSION_HOURS} hours`;
  const idleLifetime = rememberMe
    ? `${REMEMBERED_IDLE_DAYS} days`
    : `${SHORT_IDLE_HOURS} hours`;
  const userAgent = options.request?.headers.get("user-agent")?.slice(0, 512) ?? null;
  const ipHash = hashOptionalValue(getClientAddress(options.request));

  const result = await query<SessionInsertRow>(
    `INSERT INTO sessions (
       user_id,
       token_hash,
       user_agent,
       ip_hash,
       idle_ttl,
       expires_at,
       idle_expires_at
     )
     VALUES (
       $1,
       $2,
       $3,
       $4,
       $6::interval,
       NOW() + $5::interval,
       LEAST(NOW() + $5::interval, NOW() + $6::interval)
     )
     RETURNING id, expires_at`,
    [userId, tokenHash, userAgent, ipHash, absoluteLifetime, idleLifetime],
  );
  const session = result.rows[0];
  await setSessionCookie(token, session.expires_at);

  return { id: session.id, expiresAt: session.expires_at };
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await readSessionToken();
  if (!token) return null;

  const result = await query<CurrentUserRow>(
    `SELECT
       u.id,
       u.email,
       u.email_verified_at IS NOT NULL AS email_verified,
       COALESCE(
         ARRAY_AGG(ur.role) FILTER (WHERE ur.role IS NOT NULL),
         ARRAY[]::user_role[]
       ) AS roles,
       p.id AS profile_id,
       COALESCE(p.onboarding_completed, FALSE) AS onboarding_completed,
       s.id AS session_id,
       s.last_seen_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN profiles p ON p.id = u.id
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     WHERE s.token_hash = $1
       AND s.revoked_at IS NULL
       AND s.expires_at > NOW()
       AND s.idle_expires_at > NOW()
       AND u.disabled_at IS NULL
     GROUP BY u.id, p.id, s.id
     LIMIT 1`,
    [hashSessionToken(token)],
  );
  const row = result.rows[0];
  if (!row) return null;

  if (
    Date.now() - new Date(row.last_seen_at).getTime() >=
    LAST_SEEN_WRITE_INTERVAL_MINUTES * 60 * 1_000
  ) {
    await query(
      `UPDATE sessions
       SET last_seen_at = NOW(),
           idle_expires_at = LEAST(expires_at, NOW() + idle_ttl)
       WHERE id = $1 AND revoked_at IS NULL`,
      [row.session_id],
    );
  }

  return {
    id: row.id,
    email: row.email,
    emailVerified: row.email_verified,
    roles: row.roles,
    profileId: row.profile_id,
    onboardingCompleted: row.onboarding_completed === true,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError(401, "Authentication required");
  return user;
}

export async function requireRole(...allowedRoles: UserRole[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (allowedRoles.length === 0 || !allowedRoles.some((role) => user.roles.includes(role))) {
    throw new AuthError(403, "Insufficient permissions");
  }
  return user;
}

export async function rotateCurrentSession(): Promise<boolean> {
  const currentToken = await readSessionToken();
  if (!currentToken) return false;

  const nextToken = createOpaqueToken();
  const result = await query<RotatedSessionRow>(
    `UPDATE sessions
     SET token_hash = $1,
         rotated_at = NOW()
     WHERE token_hash = $2
       AND revoked_at IS NULL
       AND expires_at > NOW()
       AND idle_expires_at > NOW()
       AND rotated_at <= NOW() - $3::interval
     RETURNING expires_at`,
    [
      hashSessionToken(nextToken),
      hashSessionToken(currentToken),
      `${ROTATION_INTERVAL_HOURS} hours`,
    ],
  );
  const session = result.rows[0];
  if (!session) return false;

  await setSessionCookie(nextToken, session.expires_at);
  return true;
}

export async function revokeCurrentSession(): Promise<void> {
  const token = await readSessionToken();
  if (token) {
    await query(
      `UPDATE sessions
       SET revoked_at = COALESCE(revoked_at, NOW())
       WHERE token_hash = $1`,
      [hashSessionToken(token)],
    );
  }
  await clearSessionCookie();
}

export async function revokeSession(sessionId: string, userId: string): Promise<boolean> {
  const result = await query(
    `UPDATE sessions
     SET revoked_at = COALESCE(revoked_at, NOW())
     WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL`,
    [sessionId, userId],
  );
  return result.rowCount === 1;
}

export async function revokeAllSessions(userId: string): Promise<number> {
  const result = await withTransaction(async (client) =>
    client.query(
      `UPDATE sessions
       SET revoked_at = COALESCE(revoked_at, NOW())
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId],
    ),
  );
  return result.rowCount ?? 0;
}
