import { NextResponse } from "next/server";
import { getAIProvider, type AIMessage } from "../../../../lib/ai/provider";
import { getRepository } from "../../../../lib/repositories/server";
import { safeValidateInput, AIChatSchema } from "../../../../lib/validators/schemas";
import { SYSTEM_PROMPT_BASE } from "../../../../lib/ai/system-prompt";

// Rate limiter: max 15 requests / min per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 15;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const data = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  if (now > data.resetTime) {
    data.count = 0;
    data.resetTime = now + RATE_LIMIT_WINDOW;
  }

  data.count += 1;
  rateLimitMap.set(ip, data);

  // Periodic cleanup
  if (Math.random() < 0.05) {
    for (const [key, item] of rateLimitMap.entries()) {
      if (now > item.resetTime) rateLimitMap.delete(key);
    }
  }

  return data.count <= MAX_REQUESTS;
}

/**
 * Basic prompt injection defense to sanitize user messages
 */
function sanitizeMessageContent(content: string): string {
  // Neutralize common prompt injection patterns
  return content
    .replace(/ignore (all )?previous instructions/gi, "[отклонено]")
    .replace(/system prompt/gi, "инструкция")
    .replace(/override instructions/gi, "[отклонено]")
    .replace(/show (me )?your (secret|key|api|system)/gi, "[отклонено]");
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Слишком много запросов. Пожалуйста, подождите минуту перед следующей отправкой." },
        { status: 429 }
      );
    }

    const rawBody = await req.json().catch(() => null);
    const validation = safeValidateInput(AIChatSchema, rawBody);

    if (!validation.data) {
      return NextResponse.json(
        { error: `Некорректный запрос: ${validation.error}` },
        { status: 400 }
      );
    }

    const { messages: rawMessages } = validation.data;

    // Filter out system messages sent by client to prevent prompt injection override
    const userAndAssistantMessages = rawMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role,
        content: m.role === "user" ? sanitizeMessageContent(m.content) : m.content,
      }));

    if (userAndAssistantMessages.length === 0) {
      return NextResponse.json(
        { error: "Сообщения должны содержать хотя бы один вопрос пользователя." },
        { status: 400 }
      );
    }

    // Build minimal user context from current user state safely
    let contextPrompt = "";
    try {
      const state = await getRepository().getState();
      const contextParts: string[] = [];

      if (state.group) {
        const memberNames = state.group.members?.map((m) => m.name).join(", ");
        contextParts.push(`- Активная группа: "${state.group.name}" (бюджет: ${state.group.targetBudget} ₽)`);
        if (memberNames) contextParts.push(`- Участники группы: ${memberNames}`);
      }

      if (state.chores && state.chores.length > 0) {
        const pending = state.chores.filter((c) => !c.isDone);
        if (pending.length > 0) {
          contextParts.push(`- Активные бытовые задачи группы (${pending.length}): ${pending.slice(0, 3).map((c) => c.title).join(", ")}`);
        }
      }

      if (state.expenses && state.expenses.length > 0) {
        const recentExp = state.expenses.slice(0, 2).map((e) => `${e.title} (${e.totalAmount} ₽)`).join(", ");
        contextParts.push(`- Последние учтённые расходы: ${recentExp}`);
      }

      if (contextParts.length > 0) {
        contextPrompt = `\n\n--- ДОСТОВЕРНЫЙ ФАКТИЧЕСКИЙ КОНТЕКСТ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ ---\n` +
          contextParts.join("\n") +
          `\nИспользуй эти данные ТОЛЬКО если пользователь прямо спрашивает про свои задачи, бюджет или группу. Не придумывай данные, если их здесь нет.`;
      }
    } catch (err) {
      // PII-safe log
      console.warn("[AI Route] Context retrieval non-fatal error:", err instanceof Error ? err.message : String(err));
    }

    const systemMessage: AIMessage = {
      role: "system",
      content: SYSTEM_PROMPT_BASE + contextPrompt,
    };

    // Ensure strictly bounded history (max last 10 dialog turns)
    const recentHistory = userAndAssistantMessages.slice(-10);
    const fullMessages: AIMessage[] = [systemMessage, ...recentHistory];

    const provider = getAIProvider();
    const reply = await provider.complete(fullMessages);

    // Safe logging without user message content or PII
    console.info(`[AI Route] Successfully generated completion (messages: ${fullMessages.length})`);

    return NextResponse.json({ reply });
  } catch (error) {
    // PII-safe error logging
    console.error("[AI Route] Error handling chat request:", error instanceof Error ? error.message : "Unknown error");

    return NextResponse.json(
      {
        reply: "Сервис ИИ-помощника временно недоступен. Пожалуйста, попробуйте отправить сообщение позже или обратитесь в поддержку «Соседи».",
        error: "Ошибка ИИ-провайдера",
      },
      { status: 200 } // Return 200 with honest safe fallback answer so UI receives clean reply
    );
  }
}
