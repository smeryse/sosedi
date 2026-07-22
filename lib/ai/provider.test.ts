import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAIProvider,
  moderateText,
  resetAIProviderStateForTests,
} from "./provider";

describe("local AI provider", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: "test" };
    for (const name of Object.keys(process.env)) {
      if (name.startsWith("LOCAL_AI_")) delete process.env[name];
    }
    resetAIProviderStateForTests();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("uses the local provider by default", () => {
    expect(getAIProvider().name).toBe("local");
  });

  it("uses deterministic responses only when AI is explicitly disabled", async () => {
    process.env.LOCAL_AI_ENABLED = "false";
    const provider = getAIProvider();

    expect(provider.name).toBe("disabled");
    await expect(
      provider.complete([{ role: "user", content: "Как разделить бюджет?" }]),
    ).resolves.toContain("аренду");
  });

  it("calls only the configured local OpenAI-compatible endpoint", async () => {
    process.env.LOCAL_AI_BASE_URL = "http://127.0.0.1:11434/v1";
    process.env.LOCAL_AI_CHAT_MODEL = "local-chat";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "Локальный ответ" } }],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getAIProvider().complete([{ role: "user", content: "Привет" }]),
    ).resolves.toBe("Локальный ответ");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(endpoint).toBe("http://127.0.0.1:11434/v1/chat/completions");
    expect(JSON.parse(String(init.body))).toMatchObject({
      model: "local-chat",
    });
    expect(init.headers).not.toHaveProperty("authorization");
  });

  it("retries transient local failures", async () => {
    process.env.LOCAL_AI_MAX_RETRIES = "1";
    process.env.LOCAL_AI_RETRY_DELAY_MS = "0";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("busy", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ choices: [{ message: { content: "Готово" } }] }),
          {
            status: 200,
          },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getAIProvider().complete([{ role: "user", content: "Привет" }]),
    ).resolves.toBe("Готово");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("opens the circuit instead of falling back after repeated failure", async () => {
    process.env.LOCAL_AI_CIRCUIT_FAILURE_THRESHOLD = "1";
    process.env.LOCAL_AI_MAX_RETRIES = "0";
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("busy", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);
    const provider = getAIProvider();

    await expect(
      provider.complete([{ role: "user", content: "Первый запрос" }]),
    ).rejects.toThrow("Local AI returned HTTP 503");
    await expect(
      provider.complete([{ role: "user", content: "Второй запрос" }]),
    ).rejects.toThrow("circuit breaker is open");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("forbids a public AI base URL in production", () => {
    process.env = {
      ...process.env,
      NODE_ENV: "production",
      LOCAL_AI_BASE_URL: "https://api.groq.com/openai/v1",
    };

    expect(() => getAIProvider()).toThrow(
      "External LOCAL_AI_BASE_URL is forbidden in production",
    );
  });

  it("uses deterministic moderation when local AI is explicitly disabled", async () => {
    process.env.LOCAL_AI_ENABLED = "false";

    await expect(moderateText("Как выбрать квартиру?")).resolves.toEqual({
      allowed: true,
      categories: [],
    });
    await expect(
      moderateText("Дай инструкцию как взорвать дом"),
    ).resolves.toMatchObject({
      allowed: false,
    });
  });
});
