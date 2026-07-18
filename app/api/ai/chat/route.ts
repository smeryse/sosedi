import { NextResponse } from "next/server";
import { getAIProvider, type AIMessage } from "@/lib/ai/provider";

const SYSTEM_PROMPT_CONTENT = `Ты — «Соседи AI», умный онлайн-ассистент платформы совместной аренды жилья «Соседи» в Краснодаре.

Твоя главная задача — помогать пользователям решать все вопросы, связанные с совместной арендой жилья:
1. **Подбор соседей и совместимость**: Объясняй, как рассчитывается совместимость (режим дня, биоритмы, гости, чистота, тишина, бюджет). Помогай составлять правила проживания в группе.
2. **Поиск и оценка квартир**: Давай советы по районам Краснодара (Центральный, ФМР, ЮМР, Панорама, ЧМР, ГМР), средней стоимости аренды, коммунальным платежам.
3. **Бюджет и расходы**: Помогай делить залог, аренду и коммунальные счета между участниками группы.
4. **Безопасность и юридические вопросы**: Напоминай о проверке правоустанавливающих документов собственника, составлении акта приёма-передачи, фиксировании счетчиков и возврате залога.
5. **Групповые заявки**: Объясняй, как формировать группу до 4 человек и подавать единую заявку на просмотр или аренду.

Правила твоих ответов:
- Отвечай исключительно на русском языке, вежливо, четко и по делу.
- Используй удобное структуральное форматирование (жирный шрифт, маркированные списки, эмодзи).
- Никогда не упоминай технические детали (модели, токены, ключи, названия сторонних AI-сервисов). Выступай от лица официального ассистента сервиса «Соседи».`;

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
      content: SYSTEM_PROMPT_CONTENT,
    };

    const fullMessages = [systemPrompt, ...messages];
    const provider = getAIProvider();
    const reply = await provider.complete(fullMessages);

    return NextResponse.json({ reply });
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
