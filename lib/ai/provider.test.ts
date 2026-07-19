import { describe, expect, it } from "vitest";
import { getAIProvider } from "./provider";

describe("AI provider", () => {
  it("uses the deterministic mock when no provider key is configured", async () => {
    const provider = getAIProvider();
    expect(provider.name).toBe("mock");
    await expect(provider.complete([{ role: "user", content: "Какой бюджет?" }])).resolves.toContain("аренды");
  });
});
