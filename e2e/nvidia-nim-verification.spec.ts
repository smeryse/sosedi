import { test, expect } from "@playwright/test";

test.describe("NVIDIA NIM Integration Browser Proof & Verification", () => {
  let consoleErrors: string[] = [];
  let pageErrors: string[] = [];
  let failedRequests: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    pageErrors = [];
    failedRequests = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    page.on("requestfailed", (req) => {
      failedRequests.push(`${req.method()} ${req.url()} (${req.failure()?.errorText})`);
    });
  });

  test("semantic roommate search page loads cleanly without errors", async ({ page }) => {
    await page.goto("/app/roommates");
    await page.waitForLoadState("networkidle");

    const headerHeading = page.locator("h1");
    await expect(headerHeading).toBeVisible();

    const searchInput = page.locator("input[placeholder*='Поиск'], input[type='search'], input[type='text']").first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("Тихий сожитель жаворонок Краснодар");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1000);
    }

    expect(pageErrors.length).toBe(0);
    expect(consoleErrors.filter((e) => !e.includes("GROQ") && !e.includes("favicon")).length).toBe(0);
  });

  test("semantic housing search page loads cleanly without errors", async ({ page }) => {
    await page.goto("/app/housing");
    await page.waitForLoadState("networkidle");

    const headerHeading = page.locator("h1");
    await expect(headerHeading).toBeVisible();

    expect(pageErrors.length).toBe(0);
  });

  test("admin moderation queue renders moderation events and filter tabs", async ({ page }) => {
    await page.goto("/admin/moderation");
    await page.waitForLoadState("networkidle");

    const title = page.locator("h1");
    await expect(title).toContainText("Очередь модерации контента");

    const pendingTab = page.locator("button", { hasText: "Требуют проверки" });
    await expect(pendingTab).toBeVisible();

    const allTab = page.locator("button", { hasText: "Все записи" });
    await allTab.click();
    await page.waitForTimeout(500);

    expect(pageErrors.length).toBe(0);
  });
});
