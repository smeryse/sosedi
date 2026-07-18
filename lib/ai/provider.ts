export type AIMessage = { role: "system" | "user" | "assistant"; content: string };

export interface AIProvider {
  readonly name: "mock" | "groq" | "openrouter";
  complete(messages: AIMessage[]): Promise<string>;
}

class MockProvider implements AIProvider {
  readonly name = "mock" as const;
  async complete(messages: AIMessage[]) {
    const prompt = messages.at(-1)?.content.toLocaleLowerCase("ru") ?? "";
    if (prompt.includes("бюджет")) return "Для вашей группы закладывайте аренду до 90 000 ₽ и ещё 10% на коммунальные расходы и интернет.";
    if (prompt.includes("заявк")) return "Отправьте заявку на два подходящих объекта и договоритесь в чате группы о времени просмотра.";
    return "Я помогу сравнить соседей, жильё и правила группы. Спросите про бюджет, заявку или совместимость.";
  }
}

class OpenAICompatibleProvider implements AIProvider {
  constructor(public readonly name: "groq" | "openrouter", private readonly endpoint: string, private readonly apiKey: string, private readonly model: string) {}
  async complete(messages: AIMessage[]) {
    const response = await fetch(this.endpoint, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${this.apiKey}` }, body: JSON.stringify({ model: this.model, messages, temperature: 0.2 }) });
    if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || !("choices" in payload)) throw new Error("AI provider returned an invalid response");
    const choices = (payload as { choices?: { message?: { content?: unknown } }[] }).choices;
    const content = choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) throw new Error("AI provider returned an empty response");
    return content;
  }
}

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER;
  if (provider === "groq" && process.env.GROQ_API_KEY) return new OpenAICompatibleProvider("groq", "https://api.groq.com/openai/v1/chat/completions", process.env.GROQ_API_KEY, process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile");
  if (provider === "openrouter" && process.env.OPENROUTER_API_KEY) return new OpenAICompatibleProvider("openrouter", "https://openrouter.ai/api/v1/chat/completions", process.env.OPENROUTER_API_KEY, process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini");
  return new MockProvider();
}
