import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { sendPasswordResetEmail } from "@/lib/auth/password-reset-email";
import { query, withTransaction, type QueryResultRow } from "@/lib/db";
import {
  enforceAuthRateLimit,
  jsonResponse,
  parseJson,
  RequestValidationError,
  validationErrorResponse,
} from "../_shared";

const ForgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

const MINIMUM_RESPONSE_TIME_MS = 300;

type UserRow = QueryResultRow & { id: string };

function hashResetToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

async function waitForMinimumResponseTime(startedAt: number): Promise<void> {
  const remaining = MINIMUM_RESPONSE_TIME_MS - (Date.now() - startedAt);
  if (remaining <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, remaining));
}

export async function POST(request: Request) {
  const startedAt = Date.now();

  try {
    const input = await parseJson(request, ForgotPasswordSchema);
    const rateLimited = await enforceAuthRateLimit(
      request,
      "auth.forgot-password",
      input.email,
      5,
      60 * 60,
    );
    if (rateLimited) return rateLimited;

    const token = randomBytes(32).toString("base64url");
    try {
      const userResult = await query<UserRow>(
        `SELECT id
         FROM users
         WHERE email = $1 AND disabled_at IS NULL
         LIMIT 1`,
        [input.email],
      );
      const user = userResult.rows[0];

      if (user) {
        await withTransaction(async (client) => {
          await client.query(
            `UPDATE password_reset_tokens
             SET used_at = COALESCE(used_at, NOW())
             WHERE user_id = $1 AND used_at IS NULL`,
            [user.id],
          );
          await client.query(
            `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
             VALUES ($1, $2, NOW() + INTERVAL '30 minutes')`,
            [user.id, hashResetToken(token)],
          );
        });
      }

      await sendPasswordResetEmail(input.email, token, new URL(request.url).origin);
    } catch (error) {
      console.error("Password reset request could not be completed", error);
    }

    await waitForMinimumResponseTime(startedAt);
    return jsonResponse(
      {
        success: true,
        message: "Если аккаунт существует, инструкция отправлена на email.",
      },
      { status: 202 },
    );
  } catch (error) {
    if (error instanceof RequestValidationError) return validationErrorResponse(error);
    return jsonResponse(
      { error: { code: "INTERNAL_ERROR", message: "Не удалось обработать запрос." } },
      { status: 500 },
    );
  }
}
