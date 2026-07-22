import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { sendEmailVerification } from "@/lib/auth/password-reset-email";
import { hashPassword } from "@/lib/auth/password";
import { createSession, getCurrentUser, type UserRole } from "@/lib/auth/session";
import { withTransaction, type QueryResultRow } from "@/lib/db";
import {
  enforceAuthRateLimit,
  jsonResponse,
  parseJson,
  RequestValidationError,
  validationErrorResponse,
} from "../_shared";

const SignupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(1_024),
  displayName: z.string().trim().min(2).max(80),
  role: z.enum(["tenant", "landlord"]).optional().default("tenant"),
  rememberMe: z.boolean().optional().default(false),
});

type CreatedUserRow = QueryResultRow & { id: string };

class SignupConflictError extends Error {}

export async function POST(request: Request) {
  try {
    const input = await parseJson(request, SignupSchema);
    const rateLimited = await enforceAuthRateLimit(
      request,
      "auth.signup",
      input.email,
      5,
      60 * 60,
    );
    if (rateLimited) return rateLimited;

    const passwordHash = await hashPassword(input.password);
    const verificationToken = randomBytes(32).toString("base64url");
    const verificationTokenHash = createHash("sha256")
      .update(verificationToken, "utf8")
      .digest("hex");
    const userId = await withTransaction(async (client) => {
      const userResult = await client.query<CreatedUserRow>(
        `INSERT INTO users (email, password_hash)
         VALUES ($1, $2)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [input.email, passwordHash],
      );
      const user = userResult.rows[0];
      if (!user) throw new SignupConflictError();

      await client.query(
        `INSERT INTO profiles (id, display_name, onboarding_completed)
         VALUES ($1, $2, FALSE)`,
        [user.id, input.displayName],
      );
      await client.query(
        `INSERT INTO user_roles (user_id, role)
         VALUES ($1, $2::user_role)`,
        [user.id, input.role satisfies UserRole],
      );
      await client.query(
        `INSERT INTO user_settings (user_id)
         VALUES ($1)`,
        [user.id],
      );
      await client.query(
        `INSERT INTO notification_settings (user_id)
         VALUES ($1)`,
        [user.id],
      );
      await client.query(
        `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
        [user.id, verificationTokenHash],
      );
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
         VALUES ($1, 'auth.signup', 'user', $1)`,
        [user.id],
      );

      return user.id;
    });

    await createSession(userId, { request, rememberMe: input.rememberMe });
    try {
      await sendEmailVerification(input.email, verificationToken, new URL(request.url).origin);
    } catch (error) {
      console.error("Email verification could not be sent", error);
    }
    const user = await getCurrentUser();
    return jsonResponse({ user, verificationRequired: true }, { status: 201 });
  } catch (error) {
    if (error instanceof RequestValidationError) return validationErrorResponse(error);
    if (error instanceof SignupConflictError) {
      return jsonResponse(
        {
          error: {
            code: "SIGNUP_FAILED",
            message: "Не удалось создать аккаунт. Проверьте данные или попробуйте войти.",
          },
        },
        { status: 409 },
      );
    }
    return jsonResponse(
      { error: { code: "INTERNAL_ERROR", message: "Не удалось создать аккаунт." } },
      { status: 500 },
    );
  }
}
