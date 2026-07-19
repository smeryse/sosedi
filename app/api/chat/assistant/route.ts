import { POST as mainPostHandler } from "@/app/api/ai/chat/route";

/**
 * Proxy handler for backward compatibility with legacy /api/chat/assistant calls.
 * All logic is consolidated into /api/ai/chat/route.ts.
 */
export async function POST(req: Request) {
  return mainPostHandler(req);
}
