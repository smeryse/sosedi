import { createHash } from "node:crypto";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { revokeCurrentSession } from "@/lib/auth/session";
import { withTransaction, type QueryResultRow } from "@/lib/db";
import {
  enforceAuthRateLimit,
  jsonResponse,
  parseJson,
  RequestValidationError,
  validationErrorResponse,
} from "../_shared";

const ResetPasswordSchema = z.object({
  token: z.string().min(32).max(128),
  password: z.string().min(8).max(1_024),
});

type ResetTokenRow = QueryResultRow & { user_id: string };

class InvalidResetTokenError extends Error {}

function hashResetToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export async function POST(request: Request) {
  try {
    const input = await parseJson(request, ResetPasswordSchema);
    const rateLimited = await enforceAuthRateLimit(
      request,
      "auth.reset-password",
      "reset",
      10,
      60 * 60,
    );
    if (rateLimited) return rateLimited;

    const passwordHash = await hashPassword(input.password);
    await withTransaction(async (client) => {
      const tokenResult = await client.query<ResetTokenRow>(
        `UPDATE password_reset_tokens AS token
         SET used_at = NOW()
         FROM users
         WHERE token.token_hash = $1
           AND token.user_id = users.id
           AND token.used_at IS NULL
           AND token.expires_at > NOW()
           AND users.disabled_at IS NULL
         RETURNING token.user_id`,
        [hashResetToken(input.token)],
      );
      const resetToken = tokenResult.rows[0];
      if (!resetToken) throw new InvalidResetTokenError();

      await client.query(
        `UPDATE users
         SET password_hash = $1,
             password_changed_at = NOW(),
             updated_at = NOW()
         WHERE id = $2`,
        [passwordHash, resetToken.user_id],
      );
      await client.query(
        `UPDATE sessions
         SET revoked_at = COALESCE(revoked_at, NOW())
         WHERE user_id = $1 AND revoked_at IS NULL`,
        [resetToken.user_id],
      );
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id)
         VALUES ($1, 'auth.password_reset', 'user', $1)`,
        [resetToken.user_id],
      );
    });

    await revokeCurrentSession();
    return jsonResponse({ success: true });
  } catch (error) {
    if (error instanceof RequestValidationError) return validationErrorResponse(error);
    if (error instanceof InvalidResetTokenError) {
      return jsonResponse(
        {
          error: {
            code: "INVALID_RESET_TOKEN",
            message: "Ссылка недействительна или устарела.",
          },
        },
        { status: 400 },
      );
    }
    return jsonResponse(
      { error: { code: "INTERNAL_ERROR", message: "Не удалось сменить пароль." } },
      { status: 500 },
    );
  }
}
