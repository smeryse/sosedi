import { describe, expect, it } from "vitest";
import { compatibilityScore, groupCompatibility, propertyGroupCompatibility } from "./engine";
import type { CompatibilityProfile } from "./types";

const base: CompatibilityProfile = {
  budgetMin: 20_000,
  budgetMax: 30_000,
  districts: ["Центр"],
  moveInDate: "2026-08-01",
  leaseMonths: 12,
  smoking: "no",
  pets: "no",
  sleep: "early",
  noise: 2,
  guests: "rarely",
  remoteWork: "often",
  cleanliness: 5,
  cooking: 3,
  sharedProducts: true,
  temperature: 3,
  privateSpace: 4,
  commonZones: 3,
  sociability: 3,
  leisure: ["кино", "йога"],
};

describe("compatibility engine", () => {
  it("returns a high explainable score for aligned profiles", () => {
    const result = compatibilityScore(base, { ...base });
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.blockingConflicts).toHaveLength(0);
    expect(result.positives.length).toBeGreaterThan(0);
  });

  it("blocks an incompatible budget and smoking constraint", () => {
    const result = compatibilityScore(base, {
      ...base,
      budgetMin: 50_000,
      budgetMax: 60_000,
      smoking: "yes",
    });
    expect(result.blockingConflicts).toContain("Бюджет");
    expect(result.blockingConflicts).toContain("Курение");
    expect(result.score).toBeLessThan(60);
  });

  it("calculates a group from every pair", () => {
    const result = groupCompatibility([base, { ...base, sleep: "flexible" }, { ...base, noise: 3 }]);
    expect(result.pairResults).toHaveLength(3);
    expect(result.minimumPairScore).toBeLessThanOrEqual(result.score);
  });

  it("flags property fit conflicts", () => {
    const result = propertyGroupCompatibility({
      groupBudget: 70_000,
      propertyRent: 75_000,
      groupSize: 3,
      rooms: 2,
      groupPets: true,
      petsAllowed: false,
    });
    expect(result.passed).toBe(false);
    expect(result.blockingConflicts).toHaveLength(3);
  });
});
