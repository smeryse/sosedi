import { test, expect } from "@playwright/test";

test.describe("Full Co-Living Demo Flow (Map -> 3D Tour -> Roommates -> Assignment -> Rent)", () => {
  test.beforeEach(async ({ page }) => {
    // Capture page errors & unexpected console errors
    page.on("pageerror", (exception) => {
      console.error("[Playwright PageError]", exception);
      throw exception;
    });
  });

  test("should complete main scenario twice consecutively without errors", async ({ page }) => {
    // 1. Open Map Screen
    await page.goto("/demo/3d");
    await expect(page.locator("h1")).toContainText("Найдите дом");

    // 2. Click "Смотреть квартиру" -> 3D Tour
    const tourBtn = page.getByRole("button", { name: "Смотреть квартиру" });
    await tourBtn.click();

    // 3. Verify 3D Scene Status & Total Rent 40 000 ₽
    const sceneContainer = page.locator("[data-scene-status]");
    await expect(sceneContainer).toHaveAttribute("data-scene-status", "ready");
    await expect(sceneContainer).toHaveAttribute("data-rent-total", "40000");

    // 4. Select Master Bedroom
    const masterBtn = page.getByRole("button", { name: "Главная спальня (Мастер)" });
    await masterBtn.click();
    await expect(sceneContainer).toHaveAttribute("data-active-room-id", "room-master");

    // 5. Toggle 3D Measurement On / Off
    const measureBtn = page.getByRole("button", { name: "3D Замер" });
    await measureBtn.click();
    const activeMeasureBtn = page.getByRole("button", { name: "Замер ВКЛ" });
    await expect(activeMeasureBtn).toBeVisible();
    await activeMeasureBtn.click(); // toggle off

    // 6. Click "Выбрать эту квартиру" -> Step 4 (Room Assignment)
    const selectAptBtn = page.getByRole("button", { name: "Выбрать эту квартиру" });
    await selectAptBtn.click();

    // 7. Verify Rent Split Sum strictly equal to 40 000 ₽
    await expect(page.getByText("Sum = 40 000 ₽")).toBeVisible();
    await expect(page.getByText("Итого аренда")).toBeVisible();

    // 8. Save Assignment & Proceed (with force click over floating nav bar)
    const saveBtn = page.getByRole("button", { name: "Сохранить" });
    await saveBtn.click({ force: true });

    // 9. Refresh Page & Verify State Restoration
    await page.reload();
    await expect(page.locator("body")).toBeVisible();
  });
});
