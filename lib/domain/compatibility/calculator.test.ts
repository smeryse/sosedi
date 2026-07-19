import { describe, it, expect } from "vitest";
import { calculateMultiAxisCompatibility } from "./calculator";

describe("calculateMultiAxisCompatibility", () => {
  it("should calculate multi-axis compatibility score from user answers", () => {
    const mockAnswers = {
      1: "write-chat",
      2: "warned",
      3: "common-budget",
      4: "headphones",
      5: "agreed-hours",
    };

    const result = calculateMultiAxisCompatibility(mockAnswers);

    expect(result.overallScore).toBeGreaterThan(85);
    expect(result.highlights.length).toBeGreaterThan(0);
    expect(result.advice).toContain("«");
  });
});
