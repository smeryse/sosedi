export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LocalAIModels = {
  chat: string;
  guard: string;
  embed: string;
  rerank: string;
};

export type ModerationResult = {
  allowed: boolean;
  categories: string[];
};

export interface AIProvider {
  readonly name: "local" | "disabled";
  complete(messages: AIMessage[]): Promise<string>;
}

type LocalAIConfiguration = {
  endpoint: string;
  apiKey: string | null;
  models: LocalAIModels;
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
  circuitFailureThreshold: number;
  circuitResetMs: number;
};

type CircuitState = {
  failures: number;
  openedUntil: number;
  halfOpenRequestInFlight: boolean;
};

type CompletionPayload = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

const DEFAULT_BASE_URL = "http://127.0.0.1:11434/v1";
const DEFAULT_CHAT_MODEL = "qwen3.5:9b";
const DEFAULT_GUARD_MODEL = "llama-guard3:8b";
const DEFAULT_EMBED_MODEL = "nomic-embed-text";
const DEFAULT_RERANK_MODEL = "bge-reranker-v2-m3";
const circuits = new Map<string, CircuitState>();

class LocalAIRequestError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "LocalAIRequestError";
  }
}

export class LocalAIUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LocalAIUnavailableError";
  }
}

function readInteger(
  name: string,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;

  const value = Number.parseInt(raw, 10);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(
      `${name} must be an integer between ${minimum} and ${maximum}`,
    );
  }
  return value;
}

function readModel(name: string, fallback: string): string {
  const value = process.env[name]?.trim() || fallback;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,199}$/.test(value)) {
    throw new Error(`${name} contains unsupported characters`);
  }
  return value;
}

function isPrivateIpv4(hostname: string): boolean {
  const octets = hostname.split(".").map((part) => Number.parseInt(part, 10));
  if (
    octets.length !== 4 ||
    octets.some(
      (octet, index) =>
        !Number.isInteger(octet) ||
        octet < 0 ||
        octet > 255 ||
        String(octet) !== hostname.split(".")[index],
    )
  ) {
    return false;
  }

  return (
    octets[0] === 10 ||
    octets[0] === 127 ||
    (octets[0] === 169 && octets[1] === 254) ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168)
  );
}

function isInternalHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return (
    lower === "localhost" ||
    lower === "::1" ||
    lower === "host.docker.internal" ||
    isPrivateIpv4(lower) ||
    !lower.includes(".") ||
    lower.endsWith(".localhost") ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal") ||
    lower.endsWith(".svc") ||
    lower.endsWith(".cluster.local")
  );
}

function createCompletionEndpoint(baseUrl: string): string {
  const url = new URL(baseUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("LOCAL_AI_BASE_URL must use http or https");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(
      "LOCAL_AI_BASE_URL must not contain credentials, query, or fragment",
    );
  }
  if (
    process.env.NODE_ENV === "production" &&
    !isInternalHostname(url.hostname)
  ) {
    throw new Error("External LOCAL_AI_BASE_URL is forbidden in production");
  }

  const path = url.pathname.replace(/\/$/, "");
  if (path.endsWith("/chat/completions")) {
    url.pathname = path;
  } else if (path.endsWith("/v1")) {
    url.pathname = `${path}/chat/completions`;
  } else {
    url.pathname = `${path}/v1/chat/completions`.replace(/\/+/g, "/");
  }

  return url.toString();
}

function readEnabledFlag(): boolean {
  const value = process.env.LOCAL_AI_ENABLED?.trim().toLowerCase();
  if (!value || value === "true") return true;
  if (value === "false") return false;
  throw new Error("LOCAL_AI_ENABLED must be true or false");
}

export function getLocalAIModels(): LocalAIModels {
  return {
    chat: readModel("LOCAL_AI_CHAT_MODEL", DEFAULT_CHAT_MODEL),
    guard: readModel("LOCAL_AI_GUARD_MODEL", DEFAULT_GUARD_MODEL),
    embed: readModel("LOCAL_AI_EMBED_MODEL", DEFAULT_EMBED_MODEL),
    rerank: readModel("LOCAL_AI_RERANK_MODEL", DEFAULT_RERANK_MODEL),
  };
}

function getLocalAIConfiguration(): LocalAIConfiguration {
  return {
    endpoint: createCompletionEndpoint(
      process.env.LOCAL_AI_BASE_URL?.trim() || DEFAULT_BASE_URL,
    ),
    apiKey: process.env.LOCAL_AI_API_KEY?.trim() || null,
    models: getLocalAIModels(),
    timeoutMs: readInteger(
      "LOCAL_AI_REQUEST_TIMEOUT_MS",
      15_000,
      1_000,
      60_000,
    ),
    maxRetries: readInteger("LOCAL_AI_MAX_RETRIES", 2, 0, 4),
    retryDelayMs: readInteger("LOCAL_AI_RETRY_DELAY_MS", 150, 0, 5_000),
    circuitFailureThreshold: readInteger(
      "LOCAL_AI_CIRCUIT_FAILURE_THRESHOLD",
      3,
      1,
      20,
    ),
    circuitResetMs: readInteger(
      "LOCAL_AI_CIRCUIT_RESET_MS",
      30_000,
      1_000,
      5 * 60_000,
    ),
  };
}

function delay(milliseconds: number): Promise<void> {
  if (milliseconds <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function getCircuit(key: string): CircuitState {
  const existing = circuits.get(key);
  if (existing) return existing;

  const created = {
    failures: 0,
    openedUntil: 0,
    halfOpenRequestInFlight: false,
  };
  circuits.set(key, created);
  return created;
}

function enterCircuit(key: string): CircuitState {
  const state = getCircuit(key);
  const now = Date.now();
  if (state.openedUntil > now) {
    throw new LocalAIUnavailableError("Local AI circuit breaker is open");
  }
  if (state.openedUntil !== 0) {
    if (state.halfOpenRequestInFlight) {
      throw new LocalAIUnavailableError(
        "Local AI circuit breaker is recovering",
      );
    }
    state.halfOpenRequestInFlight = true;
  }
  return state;
}

function recordSuccess(state: CircuitState): void {
  state.failures = 0;
  state.openedUntil = 0;
  state.halfOpenRequestInFlight = false;
}

function recordFailure(
  state: CircuitState,
  configuration: LocalAIConfiguration,
): void {
  state.failures += 1;
  state.halfOpenRequestInFlight = false;
  if (state.failures >= configuration.circuitFailureThreshold) {
    state.openedUntil = Date.now() + configuration.circuitResetMs;
  }
}

export class LocalOpenAIProvider implements AIProvider {
  readonly name = "local" as const;

  constructor(
    private readonly configuration: LocalAIConfiguration,
    private readonly model: string = configuration.models.chat,
    private readonly temperature = 0.2,
  ) {}

  private async makeRequest(messages: AIMessage[]): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.configuration.timeoutMs,
    );

    try {
      const headers: Record<string, string> = {
        "content-type": "application/json",
      };
      if (this.configuration.apiKey) {
        headers.authorization = `Bearer ${this.configuration.apiKey}`;
      }

      const response = await fetch(this.configuration.endpoint, {
        method: "POST",
        headers,
        signal: controller.signal,
        cache: "no-store",
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: this.temperature,
          stream: false,
        }),
      });

      if (!response.ok) {
        const retryable =
          response.status === 408 ||
          response.status === 429 ||
          response.status >= 500;
        throw new LocalAIRequestError(
          `Local AI returned HTTP ${response.status}`,
          retryable,
        );
      }

      const payload = (await response.json()) as CompletionPayload;
      const content = payload.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) {
        throw new LocalAIRequestError(
          "Local AI returned an invalid response",
          false,
        );
      }
      if (content.length > 32_000) {
        throw new LocalAIRequestError("Local AI response is too large", false);
      }

      return content.trim();
    } catch (error) {
      if (error instanceof LocalAIRequestError) throw error;
      if (controller.signal.aborted) {
        throw new LocalAIRequestError("Local AI request timed out", true);
      }
      throw new LocalAIRequestError("Local AI request failed", true);
    } finally {
      clearTimeout(timeout);
    }
  }

  async complete(messages: AIMessage[]): Promise<string> {
    if (messages.length === 0 || messages.length > 24) {
      throw new Error("AI messages must contain between 1 and 24 entries");
    }
    if (
      messages.some(
        (message) => !message.content.trim() || message.content.length > 12_000,
      )
    ) {
      throw new Error("AI message content is empty or too large");
    }

    const circuitKey = `${this.configuration.endpoint}\u0000${this.model}`;
    const circuit = enterCircuit(circuitKey);

    try {
      let lastError: LocalAIRequestError | null = null;
      for (
        let attempt = 0;
        attempt <= this.configuration.maxRetries;
        attempt += 1
      ) {
        try {
          const result = await this.makeRequest(messages);
          recordSuccess(circuit);
          return result;
        } catch (error) {
          const requestError =
            error instanceof LocalAIRequestError
              ? error
              : new LocalAIRequestError("Local AI request failed", false);
          lastError = requestError;

          if (
            !requestError.retryable ||
            attempt === this.configuration.maxRetries
          )
            break;
          await delay(this.configuration.retryDelayMs * 2 ** attempt);
        }
      }

      recordFailure(circuit, this.configuration);
      throw new LocalAIUnavailableError(
        lastError?.message ?? "Local AI is unavailable",
      );
    } catch (error) {
      if (circuit.halfOpenRequestInFlight) {
        recordFailure(circuit, this.configuration);
      }
      throw error;
    }
  }
}

export class DeterministicFallbackProvider implements AIProvider {
  readonly name = "disabled" as const;

  async complete(messages: AIMessage[]): Promise<string> {
    const prompt = messages.at(-1)?.content.toLocaleLowerCase("ru") ?? "";

    if (/бюджет|расход|деньг|залог/.test(prompt)) {
      return "Зафиксируйте аренду, коммунальные платежи и залог отдельно. Аренду можно делить поровну или по площади комнат, коммунальные услуги — по заранее согласованному правилу.";
    }
    if (/собственник|владелец|сообщени|заявк/.test(prompt)) {
      return "Черновик: «Здравствуйте! Подскажите, пожалуйста, актуально ли объявление и когда можно посмотреть квартиру? Мы готовы заранее рассказать о составе жильцов и сроке аренды».";
    }
    if (/правил|быт|уборк|сосед/.test(prompt)) {
      return "Начните с четырёх правил: тихие часы, очередь уборки, предупреждение о гостях и порядок оплаты общих покупок.";
    }
    if (/просмотр|чек-лист|осмотр/.test(prompt)) {
      return "На просмотре проверьте документы собственника, состояние квартиры, счётчики, сантехнику и условия возврата залога.";
    }

    return "Локальный ИИ отключён. Я могу дать только базовую подсказку по бюджету, просмотру квартиры, сообщению собственнику или бытовым правилам.";
  }
}

function deterministicModeration(text: string): ModerationResult {
  const unsafePatterns: Array<{ category: string; pattern: RegExp }> = [
    {
      category: "violent_instruction",
      pattern:
        /(?:как|инструкц|помоги|способ).{0,60}(?:убить|взорвать|поджечь|отравить)/iu,
    },
    {
      category: "credential_theft",
      pattern:
        /(?:украсть|получить|перехватить).{0,50}(?:парол|токен|доступ к аккаунту)/iu,
    },
    {
      category: "sexual_minors",
      pattern: /(?:детск|несовершеннолетн).{0,30}(?:порн|секс)/iu,
    },
  ];
  const categories = unsafePatterns
    .filter(({ pattern }) => pattern.test(text))
    .map(({ category }) => category);

  return { allowed: categories.length === 0, categories };
}

function parseModerationResponse(value: string): ModerationResult {
  const normalized = value
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(normalized);
  } catch {
    throw new LocalAIUnavailableError(
      "Local guard model returned invalid JSON",
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new LocalAIUnavailableError(
      "Local guard model returned invalid moderation data",
    );
  }
  const result = parsed as Record<string, unknown>;
  if (typeof result.allowed !== "boolean") {
    throw new LocalAIUnavailableError(
      "Local guard model omitted moderation decision",
    );
  }
  const categories = Array.isArray(result.categories)
    ? result.categories
        .filter((item): item is string => typeof item === "string")
        .slice(0, 10)
    : [];

  return { allowed: result.allowed, categories };
}

export async function moderateText(text: string): Promise<ModerationResult> {
  if (text.length > 16_000) {
    return { allowed: false, categories: ["input_too_large"] };
  }
  if (!readEnabledFlag()) return deterministicModeration(text);

  const configuration = getLocalAIConfiguration();
  const guard = new LocalOpenAIProvider(
    configuration,
    configuration.models.guard,
    0,
  );
  const response = await guard.complete([
    {
      role: "system",
      content:
        "You are a content safety classifier. Return only JSON: " +
        '{"allowed":boolean,"categories":string[]}. ' +
        "Reject instructions enabling violence, sexual abuse, credential theft, fraud, or illegal access. " +
        "Allow ordinary housing, conflict-resolution, legal-safety, and financial-planning questions.",
    },
    { role: "user", content: text },
  ]);

  return parseModerationResponse(response);
}

export function getAIProvider(): AIProvider {
  if (!readEnabledFlag()) return new DeterministicFallbackProvider();
  const configuration = getLocalAIConfiguration();
  return new LocalOpenAIProvider(configuration);
}

export function resetAIProviderStateForTests(): void {
  circuits.clear();
}
