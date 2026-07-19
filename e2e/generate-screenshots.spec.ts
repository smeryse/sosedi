import { test } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Generate Proof Screenshots for Pitch & Audit", () => {
  const screenshotsDir = path.join(process.cwd(), "public", "screenshots");

  test.beforeAll(() => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test("Capture 6 proof screenshots", async ({ page, browser }) => {
    // 1. Desktop Day View
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/demo/3d");
    const tourBtn = page.getByRole("button", { name: "Смотреть квартиру" });
    await tourBtn.click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(screenshotsDir, "01_apartment_3d_day.png") });

    // 2. Bedroom Selected View with Rent
    const masterBtn = page.getByRole("button", { name: "Главная спальня (Мастер)" });
    await masterBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, "02_bedroom_selected_rent.png") });

    // 3. 3D Measurement View
    const measureBtn = page.getByRole("button", { name: "3D Замер" });
    await measureBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, "03_3d_measurement.png") });

    // 4. Mobile Night Mode View (390 x 844)
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto("/demo/3d");
    await mobilePage.getByRole("button", { name: "Смотреть квартиру" }).click();
    await mobilePage.waitForTimeout(1500);

    const nightBtn = mobilePage.getByRole("button", { name: "День" });
    if (await nightBtn.isVisible()) {
      await nightBtn.click();
      await mobilePage.waitForTimeout(1000);
    }
    await mobilePage.screenshot({ path: path.join(screenshotsDir, "04_mobile_night_390px.png") });
    await mobileContext.close();

    // 5. 3D Owner Editor View
    await page.goto("/owner/properties/demo-prop-1/editor");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(screenshotsDir, "05_3d_editor_view.png") });
  });
});
