import { describe, expect, it } from "vitest";
import { applicationInputSchema, groupInputSchema } from "./validation";

describe("domain validation", () => {
  it("accepts a complete group", () => {
    expect(groupInputSchema.safeParse({ name: "Квартира у парка", targetBudget: 90000, moveInDate: "2026-08-15" }).success).toBe(true);
  });

  it("rejects an unsafe short application message", () => {
    expect(applicationInputSchema.safeParse({ propertyId: "center-loft", groupId: "demo-group", message: "ок" }).success).toBe(false);
  });
});
