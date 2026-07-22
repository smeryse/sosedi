import { AuthError, requireUser } from "@/lib/auth/session";
import { handleAuthenticatedAIChat } from "@/lib/ai/chat-handler";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    return await handleAuthenticatedAIChat(request, user);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error(
      "[AI assistant] Authentication failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
