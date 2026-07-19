import { describe, expect, it } from "vitest";
import { scrubPII } from "./pii-scrubber";
import { NvidiaCircuitBreaker } from "./nvidia-circuit-breaker";
import { NvidiaRateLimiter } from "./nvidia-rate-limiter";
import {
  buildRoommateEmbeddingDocument,
  buildPropertyEmbeddingDocument,
} from "../../services/canonical-document-service";

describe("Phase 1: NVIDIA Infrastructure & Embeddings Tests", () => {
  describe("PII Scrubber", () => {
    it("scrubs email addresses, phone numbers, Russian passports, and API keys", () => {
      const input = "Пишите на anna@sosedi.local или звоните +7 (999) 123-45-67. Паспорт 1234 567890, ключ nvapi-xyz123";
      const scrubbed = scrubPII(input);

      expect(scrubbed).not.toContain("anna@sosedi.local");
      expect(scrubbed).not.toContain("+7 (999) 123-45-67");
      expect(scrubbed).not.toContain("1234 567890");
      expect(scrubbed).not.toContain("nvapi-xyz123");

      expect(scrubbed).toContain("[EMAIL_REDACTED]");
      expect(scrubbed).toContain("[PHONE_REDACTED]");
      expect(scrubbed).toContain("[PASSPORT_REDACTED]");
      expect(scrubbed).toContain("[TOKEN_REDACTED]");
    });
  });

  describe("NvidiaCircuitBreaker", () => {
    it("opens circuit after exceeding failure threshold and blocks requests", () => {
      const breaker = new NvidiaCircuitBreaker(3, 10000);
      expect(breaker.getState()).toBe("CLOSED");

      breaker.onFailure(500);
      breaker.onFailure(500);
      expect(breaker.getState()).toBe("CLOSED");

      breaker.onFailure(500);
      expect(breaker.getState()).toBe("OPEN");

      expect(() => breaker.checkState()).toThrow("NVIDIA Circuit Breaker is OPEN");
    });
  });

  describe("NvidiaRateLimiter", () => {
    it("enforces rate limit per user/IP window", () => {
      const limiter = new NvidiaRateLimiter();
      limiter.checkLimit("user-1", 2, 60000);
      limiter.checkLimit("user-1", 2, 60000);

      expect(() => limiter.checkLimit("user-1", 2, 60000)).toThrow("Превышен лимит запросов AI");
    });
  });

  describe("Canonical Document Builders", () => {
    it("builds deterministic roommate document and matching sourceHash", () => {
      const doc1 = buildRoommateEmbeddingDocument(
        { displayName: "Анна", city: "Краснодар", budgetMax: 40000, jobTitle: "Дизайнер" },
        { districts: ["Центральный"], sleepSchedule: "early", smoking: "no" },
        [{ questionKey: "pets", answer: "Без животных" }]
      );

      const doc2 = buildRoommateEmbeddingDocument(
        { displayName: "Анна", city: "Краснодар", budgetMax: 40000, jobTitle: "Дизайнер" },
        { districts: ["Центральный"], sleepSchedule: "early", smoking: "no" },
        [{ questionKey: "pets", answer: "Без животных" }]
      );

      expect(doc1.text).toBe(doc2.text);
      expect(doc1.sourceHash).toBe(doc2.sourceHash);
      expect(doc1.text).not.toContain("anna@sosedi.local");
      expect(doc1.text.length).toBeLessThan(16000);
    });

    it("builds property embedding document", () => {
      const propDoc = buildPropertyEmbeddingDocument({
        title: " Уютная 1-к квартира в центре",
        district: "Центральный",
        city: "Краснодар",
        monthlyRent: 25000,
        rooms: 1,
        area: 35,
      });

      expect(propDoc.text).toContain("Город: Краснодар.");
      expect(propDoc.text).toContain("Район: Центральный.");
      expect(propDoc.sourceHash).toBeDefined();
    });
  });
});
