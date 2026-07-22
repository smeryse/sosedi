import { z } from "zod";
import { createSession, getCurrentUser } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { query, type QueryResultRow } from "@/lib/db";
import {
  enforceAuthRateLimit,
  jsonResponse,
  parseJson,
  RequestValidationError,
  validationErrorResponse,
} from "../_shared";

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(1_024),
  rememberMe: z.boolean().optional().default(false),
});

type UserCredentialRow = QueryResultRow & {
  id: string;
  password_hash: string;
  disabled_at: Date | null;
};

export async function POST(request: Request) {
  try {
    const input = await parseJson(request, LoginSchema);
    const rateLimited = await enforceAuthRateLimit(
      request,
      "auth.login",
      input.email,
      10,
      15 * 60,
    );
    if (rateLimited) return rateLimited;

    const result = await query<UserCredentialRow>(
      `SELECT id, password_hash, disabled_at
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [input.email],
    );
    const account = result.rows[0];
    const passwordMatches = await verifyPassword(
      input.password,
      account?.password_hash ?? "invalid-password-hash",
    );

    if (!account || !passwordMatches || account.disabled_at) {
      return jsonResponse(
        {
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Не удалось войти. Проверьте email и пароль.",
          },
        },
        { status: 401 },
      );
    }

    await createSession(account.id, { request, rememberMe: input.rememberMe });
    const user = await getCurrentUser();
    return jsonResponse({ user });
  } catch (error) {
    if (error instanceof RequestValidationError) return validationErrorResponse(error);
    return jsonResponse(
      { error: { code: "INTERNAL_ERROR", message: "Не удалось выполнить вход." } },
      { status: 500 },
    );
  }
}
