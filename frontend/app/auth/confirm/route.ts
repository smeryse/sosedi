import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { withTransaction, type QueryResultRow } from "@/lib/db";

type VerificationRow = QueryResultRow & { user_id: string };

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || token.length < 32 || token.length > 128) {
    redirect("/auth/error?reason=invalid_verification_link");
  }

  const tokenHash = createHash("sha256").update(token, "utf8").digest("hex");
  const verified = await withTransaction(async (client) => {
    const result = await client.query<VerificationRow>(
      `UPDATE email_verification_tokens AS token
       SET used_at = NOW()
       FROM users
       WHERE token.token_hash = $1
         AND token.user_id = users.id
         AND token.used_at IS NULL
         AND token.expires_at > NOW()
         AND users.disabled_at IS NULL
       RETURNING token.user_id`,
      [tokenHash],
    );
    const verification = result.rows[0];
    if (!verification) return false;

    await client.query(
      `UPDATE users
       SET email_verified_at = COALESCE(email_verified_at, NOW()),
           updated_at = NOW()
       WHERE id = $1`,
      [verification.user_id],
    );
    return true;
  });

  redirect(verified ? "/auth/login?verified=1" : "/auth/error?reason=expired_verification_link");
}
