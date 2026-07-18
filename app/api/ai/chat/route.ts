import { NextResponse } from "next/server";
import { getAIProvider, type AIMessage } from "@/lib/ai/provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: AIMessage[] = body.messages ?? [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Сообщения должны быть непустым массивом" },
        { status: 400 },
      );
    }

    const systemPrompt: AIMessage = {
      role: "system",
      content:
        "Ты — AI-ассистент платформы «Соседи» (сервис подбора совместимых жильцов, квартир и правил проживания). Отвечай вежливо, предметно и помогай пользователям организовывать совместную аренду.",
    };

    const fullMessages = [systemPrompt, ...messages];
    const provider = getAIProvider();
    const reply = await provider.complete(fullMessages);

    return NextResponse.json({ reply, provider: provider.name });
  } catch (error) {
    console.error("AI Chat Route Error:", error);
    return NextResponse.json(
      {
        error: "Не удалось получить ответ AI",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
