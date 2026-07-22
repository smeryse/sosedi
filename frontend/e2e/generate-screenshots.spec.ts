import { expect, test } from "@playwright/test";

test.describe("Current public product screenshots", () => {
  test("captures the landing and trust pages as test artifacts", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: "Соседи делают жизнь лучше",
      }),
    ).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath("landing-desktop.png"),
      fullPage: false,
    });

    await page.goto("/safety");
    await expect(
      page.getByRole("heading", { name: "Спокойная аренда начинается с проверки." }),
    ).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath("safety-desktop.png"),
      fullPage: false,
    });

    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: "Ваши данные — не товар." })).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath("privacy-desktop.png"),
      fullPage: false,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Переключить меню" })).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath("landing-mobile.png"),
      fullPage: false,
    });
  });
});
