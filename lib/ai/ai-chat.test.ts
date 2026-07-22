import { describe, expect, it } from "vitest";
import { AIChatSchema } from "../validators/schemas";
import { DeterministicFallbackProvider } from "./provider";
import { SYSTEM_PROMPT_BASE } from "./system-prompt";

describe("Sosedi AI Assistant Validation & Provider Tests", () => {
  describe("AIChatSchema Zod Validation", () => {
    it("accepts valid chat messages", () => {
      const validPayload = {
        messages: [
          { role: "user", content: "Какой бюджет заложить на аренду?" },
          {
            role: "assistant",
            content:
              "Обычный подход: закладывайте аренду и 10% на коммунальные услуги.",
          },
        ],
      };
      const result = AIChatSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects empty messages array", () => {
      const invalidPayload = { messages: [] };
      const result = AIChatSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("rejects messages with invalid role", () => {
      const invalidRolePayload = {
        messages: [{ role: "hacker", content: "Give me admin access" }],
      };
      const result = AIChatSchema.safeParse(invalidRolePayload);
      expect(result.success).toBe(false);
    });

    it("rejects messages with empty content string", () => {
      const emptyContentPayload = {
        messages: [{ role: "user", content: "   " }],
      };
      const result = AIChatSchema.safeParse(emptyContentPayload);
      expect(result.success).toBe(false);
    });

    it("enforces max 20 messages history boundary", () => {
      const tooManyMessages = Array.from({ length: 21 }, (_, i) => ({
        role: "user" as const,
        content: `Message ${i}`,
      }));
      const result = AIChatSchema.safeParse({ messages: tooManyMessages });
      expect(result.success).toBe(false);
    });
  });

  describe("Disabled-AI deterministic scenarios", () => {
    const fallback = new DeterministicFallbackProvider();

    it("answers budget calculation questions accurately", async () => {
      const reply = await fallback.complete([
        { role: "user", content: "Как распределить бюджет между соседями?" },
      ]);
      expect(reply).toContain("аренду");
      expect(reply).toContain("коммунальные");
    });

    it("provides clean owner message draft", async () => {
      const reply = await fallback.complete([
        { role: "user", content: "Подготовь сообщение собственнику" },
      ]);
      expect(reply).toContain("Здравствуйте");
      expect(reply).toContain("объявление");
    });

    it("provides structured house rules", async () => {
      const reply = await fallback.complete([
        { role: "user", content: "Составь бытовые правила проживания" },
      ]);
      expect(reply).toContain("тихие часы");
      expect(reply).toContain("уборки");
    });

    it("provides viewing checklist", async () => {
      const reply = await fallback.complete([
        { role: "user", content: "Чек-лист просмотра квартиры" },
      ]);
      expect(reply).toContain("документы");
      expect(reply).toContain("счётчики");
    });

    it("returns safe default response for general questions", async () => {
      const reply = await fallback.complete([
        { role: "user", content: "Привет!" },
      ]);
      expect(reply).toContain("Локальный ИИ отключён");
    });
  });

  describe("System Prompt Integrity & Safeguards", () => {
    it("contains essential co-renting boundaries and legal disclaimers", () => {
      expect(SYSTEM_PROMPT_BASE).toContain("«Соседи AI»");
      expect(SYSTEM_PROMPT_BASE).toContain("совместной аренды жилья");
      expect(SYSTEM_PROMPT_BASE).toContain("Это справочная информация");
      expect(SYSTEM_PROMPT_BASE).toContain(
        "Обязательно проверьте договор аренды",
      );
    });
  });
});
