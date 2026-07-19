export type AIMessage = { role: "system" | "user" | "assistant"; content: string };

export interface AIProvider {
  readonly name: "mock" | "groq" | "openrouter" | "resilient";
  complete(messages: AIMessage[]): Promise<string>;
}

export class MockProvider implements AIProvider {
  readonly name = "mock" as const;

  async complete(messages: AIMessage[]): Promise<string> {
    const prompt = messages.at(-1)?.content.toLocaleLowerCase("ru") ?? "";

    if (prompt.includes("бюджет") || prompt.includes("расход") || prompt.includes("деньги") || prompt.includes("залог")) {
      return "При делении бюджета зафиксируйте общую сумму аренды и коммунальных платежей. Обычный практичный подход: плата за жильё делится поровну или пропорционально площади комнат, а коммунальные услуги и интернет — строго поровну между участниками группы. Обратите внимание: залог платится разово при заселении и возвращается по акту приёма-передачи.";
    }

    if (prompt.includes("собственник") || prompt.includes("сообщени") || prompt.includes("владелец") || prompt.includes("заявк")) {
      return "Шаблон сообщения собственнику:\n\n«Здравствуйте! Мы ищем квартиру для совместной аренды в вашей локации. Наша группа состоит из ответственных жильцов с постоянным доходом. Подскажите, актуально ли объявление и когда можно договориться о просмотре?»\n\nПеред подписанием обязательно проверьте документы на право собственности и паспорт владельца.";
    }

    if (prompt.includes("правил") || prompt.includes("быт") || prompt.includes("уборк") || prompt.includes("сосед")) {
      return "Рекомендуемый свод правил проживания:\n1. Тихий час: с 22:00 до 08:00 по будням.\n2. Уборка общих зон (кухня, ванна): по очереди раз в неделю.\n3. Гости: предупреждать сожителей в общем чате минимум за 3-4 часа.\n4. Бытовые покупки: туалетная бумага, средства для уборки и пакеты для мусора покупаются из общего фонда.";
    }

    if (prompt.includes("просмотр") || prompt.includes("чек-лист") || prompt.includes("осмотр")) {
      return "Чек-лист перед просмотром жилья:\n1. Проверьте паспорт собственника и выписку из ЕГРН (документы на квартиру).\n2. Проверьте напор воды, работу плиты, розеток и оконных замков.\n3. Зафиксируйте показания всех счетчиков в акте приёма-передачи.\n4. Уточните в договоре условия возврата залога и порядок оплаты коммунальных счетов.";
    }

    return "Я помогу сравнить варианты жилья, составить сообщение собственнику, рассчитать бюджет группы или подготовить бытовые правила. Уточните ваш вопрос по совместной аренде!";
  }
}

export class SingleAPIProvider {
  constructor(
    public readonly name: "groq" | "openrouter",
    private readonly endpoint: string,
    private readonly apiKey: string,
    private readonly candidateModels: string[],
  ) {}

  async complete(messages: AIMessage[]): Promise<string> {
    let lastError: Error | null = null;

    for (const model of this.candidateModels) {
      try {
        const response = await fetch(this.endpoint, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://sosedi.local",
            "X-Title": "Sosedi Platform",
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`[${this.name}] Model ${model} returned ${response.status}: ${errorText}`);
          lastError = new Error(`Provider ${this.name} (${model}) returned ${response.status}: ${errorText}`);
          continue;
        }

        const payload: unknown = await response.json();
        if (!payload || typeof payload !== "object" || !("choices" in payload)) {
          console.warn(`[${this.name}] Model ${model} returned invalid payload structure`);
          continue;
        }

        const choices = (payload as { choices?: { message?: { content?: unknown } }[] }).choices;
        const content = choices?.[0]?.message?.content;

        if (typeof content !== "string" || !content.trim()) {
          console.warn(`[${this.name}] Model ${model} returned empty content`);
          continue;
        }

        return content;
      } catch (err) {
        console.warn(`[${this.name}] Error connecting to model ${model}:`, err);
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    throw lastError || new Error(`Provider ${this.name} failed all candidate models.`);
  }
}

export class ResilientMultiProvider implements AIProvider {
  readonly name = "resilient" as const;

  constructor(
    private readonly providers: SingleAPIProvider[],
    private readonly mockFallback: MockProvider,
  ) {}

  async complete(messages: AIMessage[]): Promise<string> {
    for (const provider of this.providers) {
      try {
        const result = await provider.complete(messages);
        return result;
      } catch (err) {
        console.warn(`Provider ${provider.name} failed, attempting next provider in fallback chain:`, err);
      }
    }

    console.warn("All external AI providers failed. Using local MockProvider fallback.");
    return await this.mockFallback.complete(messages);
  }
}

export function getAIProvider(): AIProvider {
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const providers: SingleAPIProvider[] = [];

  if (groqKey) {
    const primaryGroqModel = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
    const groqModels = [
      primaryGroqModel,
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768",
    ].filter((m, i, arr) => m && arr.indexOf(m) === i);

    providers.push(
      new SingleAPIProvider(
        "groq",
        "https://api.groq.com/openai/v1/chat/completions",
        groqKey,
        groqModels,
      ),
    );
  }

  if (openrouterKey) {
    const primaryOpenRouterModel = process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash";
    const openrouterModels = [
      primaryOpenRouterModel,
      "google/gemini-2.5-flash",
      "meta-llama/llama-3.3-70b-instruct:free",
      "deepseek/deepseek-chat",
      "nvidia/llama-3.1-nemotron-70b-instruct",
      "openai/gpt-4o-mini",
      "qwen/qwen-2.5-coder-32b-instruct:free",
    ].filter((m, i, arr) => m && arr.indexOf(m) === i);

    providers.push(
      new SingleAPIProvider(
        "openrouter",
        "https://openrouter.ai/api/v1/chat/completions",
        openrouterKey,
        openrouterModels,
      ),
    );
  }

  if (providers.length > 0) {
    return new ResilientMultiProvider(providers, new MockProvider());
  }

  return new MockProvider();
}
