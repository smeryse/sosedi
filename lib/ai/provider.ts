export type AIMessage = { role: "system" | "user" | "assistant"; content: string };

export interface AIProvider {
  readonly name: "mock" | "groq" | "openrouter";
  complete(messages: AIMessage[]): Promise<string>;
}

class MockProvider implements AIProvider {
  readonly name = "mock" as const;
  async complete(messages: AIMessage[]) {
    const prompt = messages.at(-1)?.content.toLocaleLowerCase("ru") ?? "";
    if (prompt.includes("бюджет")) {
      return "Для вашей группы закладывайте аренду до 90 000 ₽ и ещё 10% на коммунальные расходы и интернет.";
    }
    if (prompt.includes("заявк")) {
      return "Отправьте заявку на два подходящих объекта и договоритесь в чате группы о времени просмотра.";
    }
    if (prompt.includes("сосед") || prompt.includes("правил")) {
      return "Начните с трёх тем: режим сна, гости и уборка. Зафиксируйте соглашение в кабинете группы.";
    }
    return "Я помогу сравнить соседей, жильё и правила группы. Спросите про бюджет, заявку или совместимость.";
  }
}

class OpenAICompatibleProvider implements AIProvider {
  constructor(
    public readonly name: "groq" | "openrouter",
    private readonly endpoint: string,
    private readonly apiKey: string,
    private readonly primaryModel: string,
  ) {}

  async complete(messages: AIMessage[]): Promise<string> {
    const modelsToTry = [
      this.primaryModel,
      "google/gemini-2.5-flash",
      "meta-llama/llama-3.3-70b-instruct:free",
      "deepseek/deepseek-chat",
      "nvidia/llama-3.1-nemotron-70b-instruct",
      "openai/gpt-4o-mini",
      "qwen/qwen-2.5-coder-32b-instruct:free",
    ].filter((m, i, arr) => m && arr.indexOf(m) === i);

    let lastError: Error | null = null;

    for (const model of modelsToTry) {
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
            temperature: 0.2,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`Model ${model} returned ${response.status}: ${errorText}`);
          lastError = new Error(`Model ${model} returned ${response.status}: ${errorText}`);
          continue;
        }

        const payload: unknown = await response.json();
        if (!payload || typeof payload !== "object" || !("choices" in payload)) {
          console.warn(`Model ${model} returned invalid payload structure`);
          continue;
        }

        const choices = (payload as { choices?: { message?: { content?: unknown } }[] }).choices;
        const content = choices?.[0]?.message?.content;

        if (typeof content !== "string" || !content.trim()) {
          console.warn(`Model ${model} returned empty content`);
          continue;
        }

        return content;
      } catch (err) {
        console.warn(`Error connecting to model ${model}:`, err);
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    // Smart fallback if all API models are rate limited or unavailable
    console.warn("All OpenRouter models failed:", lastError);
    const mock = new MockProvider();
    return await mock.complete(messages);
  }
}

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if ((provider === "openrouter" || (!provider && openrouterKey)) && openrouterKey) {
    return new OpenAICompatibleProvider(
      "openrouter",
      "https://openrouter.ai/api/v1/chat/completions",
      openrouterKey,
      process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash",
    );
  }

  if ((provider === "groq" || (!provider && groqKey)) && groqKey) {
    return new OpenAICompatibleProvider(
      "groq",
      "https://api.groq.com/openai/v1/chat/completions",
      groqKey,
      process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
    );
  }

  return new MockProvider();
}
