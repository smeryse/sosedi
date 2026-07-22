import { revokeCurrentSession } from "@/lib/auth/session";
import { jsonResponse } from "../_shared";

export async function POST() {
  await revokeCurrentSession();
  return jsonResponse({ success: true });
}
