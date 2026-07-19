import { test, expect } from "@playwright/test";

test.describe("Owner Property 3D Floorplan Editor", () => {
  test("should open owner editor in 3D mode, select tools, and save draft", async ({ page }) => {
    await page.goto("/owner/properties/demo-prop-1/editor");

    const editorHeader = page.locator("header").filter({ hasText: "Редактор собственника" });

    // 1. Verify Header & Title
    await expect(editorHeader).toContainText("Объект #demo-prop-1");
    await expect(editorHeader).toContainText("Редактор собственника");

    // 2. Verify 3D Canvas is visible
    await expect(page.locator("canvas")).toBeVisible();

    // 3. Select Wall Tool
    const wallToolBtn = page.getByRole("button", { name: "Стена" });
    await wallToolBtn.click();

    // 4. Save Draft
    const saveBtn = page.getByRole("button", { name: "Черновик" });
    await saveBtn.click();
    await expect(editorHeader).toContainText("Сохранение...");
  });
});
