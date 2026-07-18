export type AIMessage = { role: "system" | "user" | "assistant"; content: string };

export interface AIProvider {
  readonly name: "mock" | "groq" | "openrouter" | "resilient";
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

class SingleAPIProvider {
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

class ResilientMultiProvider implements AIProvider {
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

    console.warn("All external AI providers failed. Using local MockProvider.");
    return await this.mockFallback.complete(messages);
  }
}

export function getAIProvider(): AIProvider {
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const providers: SingleAPIProvider[] = [];

  // Prioritize Groq API as primary for speed (75ms response) and zero rate limits
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

  // OpenRouter as high-capability secondary provider
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
