import "server-only";

import { createHmac } from "node:crypto";
import { query, type QueryResultRow } from "@/lib/db";

type RateLimitRow = QueryResultRow & {
  request_count: number;
  expires_at: Date;
};

export type RateLimitOptions = {
  scope: string;
  key: string;
  limit: number;
  windowSeconds: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

function hashRateLimitKey(key: string): string {
  const secret =
    process.env.AUTH_RATE_LIMIT_SECRET ??
    process.env.AUTH_PASSWORD_PEPPER ??
    "sosedi-rate-limit-local-development";
  return createHmac("sha256", secret).update(key, "utf8").digest("hex");
}

export function getRequestIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function consumeRateLimit(
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  if (
    !Number.isSafeInteger(options.limit) ||
    options.limit <= 0 ||
    !Number.isSafeInteger(options.windowSeconds) ||
    options.windowSeconds <= 0
  ) {
    throw new Error("Invalid rate-limit configuration");
  }

  const now = Date.now();
  const windowMs = options.windowSeconds * 1_000;
  const windowStartedAt = new Date(Math.floor(now / windowMs) * windowMs);
  const expiresAt = new Date(windowStartedAt.getTime() + windowMs);
  const result = await query<RateLimitRow>(
    `INSERT INTO rate_limit_buckets (
       scope,
       key_hash,
       window_started_at,
       request_count,
       expires_at
     )
     VALUES ($1, $2, $3, 1, $4)
     ON CONFLICT (scope, key_hash, window_started_at)
     DO UPDATE SET request_count = rate_limit_buckets.request_count + 1
     RETURNING request_count, expires_at`,
    [options.scope, hashRateLimitKey(options.key), windowStartedAt, expiresAt],
  );
  const bucket = result.rows[0];
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((new Date(bucket.expires_at).getTime() - Date.now()) / 1_000),
  );

  return {
    allowed: bucket.request_count <= options.limit,
    remaining: Math.max(0, options.limit - bucket.request_count),
    retryAfterSeconds,
  };
}
