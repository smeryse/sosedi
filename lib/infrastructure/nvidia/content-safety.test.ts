import { describe, expect, it } from "vitest";
import { evaluateLocalRules, ContentSafetyClient } from "./content-safety-client";
import { globalModerationQueueService } from "../../services/moderation-queue-service";

describe("Phase 3: Text Moderation & Fallback Engine", () => {
  it("detects Russian profanity using local rule engine fallback", () => {
    const res = evaluateLocalRules("Тыполный сука и гандон!");
    expect(res.allowed).toBe(false);
    expect(res.action).toBe("block");
    expect(res.categories.profanity).toBe(true);
  });

  it("detects fraud patterns and flags for review", () => {
    const res = evaluateLocalRules("Переведи предоплату на карту до просмотра квартиры");
    expect(res.allowed).toBe(false);
    expect(res.action).toBe("block");
    expect(res.categories.fraud).toBe(true);
  });

  it("detects contact leakage patterns", () => {
    const res = evaluateLocalRules("Пиши в телеграм: @anna_sosedi_test");
    expect(res.action).toBe("review");
    expect(res.categories.contactLeak).toBe(true);
  });

  it("passes safe Russian co-living text", () => {
    const res = evaluateLocalRules("Ищу тихую девушку в двухкомнатную квартиру в центре Краснодара.");
    expect(res.allowed).toBe(true);
    expect(res.action).toBe("allow");
  });

  it("evaluates text safety gracefully with fallback", async () => {
    const client = new ContentSafetyClient();
    const result = await client.evaluateTextSafety("Здравствуйте, квартира сдаётся на длительный срок.");
    expect(result.allowed).toBe(true);
  });
});
