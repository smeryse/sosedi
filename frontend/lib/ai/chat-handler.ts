import type { CurrentUser } from "@/lib/auth/session";
import {
  getAIProvider,
  LocalAIUnavailableError,
  moderateText,
  type AIMessage,
} from "@/lib/ai/provider";
import {
  consumeAIRateLimit,
  hasAIConsent,
  sanitizePromptContent,
  scrubPII,
} from "@/lib/ai/request-safety";
import { SYSTEM_PROMPT_BASE } from "@/lib/ai/system-prompt";
import { AIChatSchema, safeValidateInput } from "@/lib/validators/schemas";
import { NextResponse } from "next/server";

const MAX_PROMPT_CHARACTERS = 16_000;

function unavailableResponse(): NextResponse {
  return NextResponse.json(
    {
      error: "Локальный ИИ временно недоступен. Попробуйте позже.",
      code: "LOCAL_AI_UNAVAILABLE",
    },
    { status: 503 },
  );
}

export async function handleAuthenticatedAIChat(
  request: Request,
  user: CurrentUser,
): Promise<NextResponse> {
  const rateLimit = consumeAIRateLimit(user.id);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Слишком много запросов. Подождите минуту." },
      {
        status: 429,
        headers: { "retry-after": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  try {
    if (!(await hasAIConsent(user.id))) {
      return NextResponse.json(
        { error: "Для ИИ-помощника нужно явно разрешить обработку данных." },
        { status: 403 },
      );
    }

    const rawBody = await request.json().catch(() => null);
    const validation = safeValidateInput(AIChatSchema, rawBody);
    if (!validation.data) {
      return NextResponse.json(
        { error: `Некорректный запрос: ${validation.error}` },
        { status: 400 },
      );
    }

    const messages = validation.data.messages
      .filter(
        (message): message is { role: "user" | "assistant"; content: string } =>
          message.role === "user" || message.role === "assistant",
      )
      .slice(-10)
      .map((message) => ({
        role: message.role,
        content:
          message.role === "user"
            ? sanitizePromptContent(message.content)
            : scrubPII(message.content),
      }));

    if (!messages.some((message) => message.role === "user")) {
      return NextResponse.json(
        { error: "Нужен хотя бы один вопрос пользователя." },
        { status: 400 },
      );
    }

    const promptCharacters = messages.reduce(
      (total, message) => total + message.content.length,
      0,
    );
    if (promptCharacters > MAX_PROMPT_CHARACTERS) {
      return NextResponse.json(
        { error: "История диалога слишком длинная." },
        { status: 400 },
      );
    }

    const moderationInput = messages
      .filter((message) => message.role === "user")
      .map((message) => message.content)
      .join("\n---\n");
    const inputModeration = await moderateText(moderationInput);
    if (!inputModeration.allowed) {
      return NextResponse.json(
        { error: "Запрос нельзя обработать из-за правил безопасности." },
        { status: 400 },
      );
    }

    const fullMessages: AIMessage[] = [
      { role: "system", content: SYSTEM_PROMPT_BASE },
      ...messages,
    ];
    const provider = getAIProvider();
    const rawReply = await provider.complete(fullMessages);
    const outputModeration = await moderateText(rawReply);
    if (!outputModeration.allowed) {
      console.warn("[AI chat] Local guard rejected model output");
      return NextResponse.json(
        { error: "Ответ модели отклонён проверкой безопасности." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { reply: scrubPII(rawReply) },
      { headers: { "cache-control": "private, no-store" } },
    );
  } catch (error) {
    if (error instanceof LocalAIUnavailableError) return unavailableResponse();

    console.error(
      "[AI chat] Request failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return unavailableResponse();
  }
}
