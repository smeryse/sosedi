import { expect, test } from "@playwright/test";

test.describe("Sosedi Full Demo Scenario E2E", () => {
  test("authenticates via demo account button, navigates messages, sends message & verifies viewing request", async ({
    page,
  }) => {
    // 1. Login via Demo Account Button
    await page.goto("/auth/login");
    const demoButton = page.getByRole("button", { name: "Войти в демо-аккаунт" });
    await expect(demoButton).toBeVisible();
    await demoButton.click();

    // Verify redirected to /app
    await page.waitForURL("**/app**");
    await expect(page).toHaveURL(/\/app/);

    // 2. Open Messages Page
    await page.goto("/app/messages");
    await page.waitForLoadState("networkidle");

    // Check chats sidebar exists
    const chatSidebar = page.locator("aside, div").filter({ hasText: "Чаты" });
    await expect(chatSidebar.first()).toBeVisible();

    // 3. Open Owner Chat if present or direct chat
    const ownerChat = page.locator("text=Собственник").first();
    if (await ownerChat.isVisible()) {
      await ownerChat.click();
    }

    // 4. Check Chat Window & Messages
    const chatInput = page.getByPlaceholder("Напишите сообщение...");
    await expect(chatInput).toBeVisible();

    // 5. Send Message
    const timestampMsg = `Тестовое сообщение ${Date.now()}`;
    await chatInput.fill(timestampMsg);
    const sendButton = page.getByRole("button", { name: "Отправить сообщение" });
    await sendButton.click();

    // Check optimistic insertion
    await expect(page.locator(`text=${timestampMsg}`).first()).toBeVisible();

    // 6. Reload page and check persistence
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator(`text=${timestampMsg}`).first()).toBeVisible();

    // 7. Verify Viewing Request card buttons if present
    const confirmButton = page.getByRole("button", { name: "Подтвердить" });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
      await expect(page.locator("text=Статус: Подтверждено").first()).toBeVisible();
    }
  });
});
