import { getCurrentUser, rotateCurrentSession } from "@/lib/auth/session";
import { jsonResponse } from "../_shared";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return jsonResponse(
      { error: { code: "UNAUTHENTICATED", message: "Требуется авторизация." } },
      { status: 401 },
    );
  }

  await rotateCurrentSession();
  return jsonResponse({ user });
}
