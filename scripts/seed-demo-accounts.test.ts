import { describe, expect, it } from "vitest";
import { DEMO_USERS_CONFIG, seedDemoAccounts } from "./seed-demo-accounts";
import { resetDemoAccounts } from "./reset-demo-accounts";

describe("Seed and Reset Demo Accounts", () => {
  it("defines 6 synthetic demo accounts with controlled emails and non-personal data", () => {
    expect(DEMO_USERS_CONFIG).toHaveLength(6);
    const emails = DEMO_USERS_CONFIG.map((u) => u.email);
    expect(emails).toContain("anna.demo@sosedi.local");
    expect(emails).toContain("zhenya.demo@sosedi.local");
    expect(emails).toContain("maria.demo@sosedi.local");
    expect(emails).toContain("owner.demo@sosedi.local");

    // No developer real emails
    for (const u of DEMO_USERS_CONFIG) {
      expect(u.email).not.toContain("gmail.com");
      expect(u.email).not.toContain("yandex.ru");
      expect(u.seedKey).toBeDefined();
    }
  });

  it("handles dry-run or fallback mode gracefully when Supabase keys are not present", async () => {
    const seedRes = await seedDemoAccounts();
    expect(seedRes).toBeDefined();

    const resetRes = await resetDemoAccounts();
    expect(resetRes).toBeDefined();
  });
});
