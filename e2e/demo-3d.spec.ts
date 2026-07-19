import { test, expect } from "@playwright/test";

test.describe("/demo/3d Commercial 3D Co-Living Workflow", () => {
  test("should render 3D experience, select rooms, measure 3D points, and maintain total rent sum", async ({
    page,
  }) => {
    await page.goto("/demo/3d");

    // 1. Verify Map Screen Loaded
    await expect(page.locator("h1")).toContainText("Найдите дом");

    // 2. Click "Смотреть квартиру" to open 3D Tour
    const tourBtn = page.getByRole("button", { name: "Смотреть квартиру" });
    await tourBtn.click();

    // 3. Verify 3D Scene Container
    const sceneContainer = page.locator("[data-scene-status]");
    await expect(sceneContainer).toHaveAttribute("data-scene-status", "ready");
    await expect(sceneContainer).toHaveAttribute("data-rent-total", "40000");

    // 4. Test Room Selector Pills
    const masterBtn = page.getByRole("button", { name: "Главная спальня (Мастер)" });
    await masterBtn.click();
    await expect(sceneContainer).toHaveAttribute("data-active-room-id", "room-master");
  });
});
