import { expect, test } from "@playwright/test";

test.describe("Retired interactive demo route", () => {
  test("redirects the old demo URL to the current housing flow", async ({
    page,
    request,
  }) => {
    const response = await request.get("/demo/3d", { maxRedirects: 0 });
    const location = response.headers().location;

    expect(response.status()).toBe(308);
    expect(location).toBeTruthy();
    expect(new URL(location!).pathname).toBe("/app/housing");

    await page.goto("/demo/3d");

    const finalUrl = new URL(page.url());
    expect(finalUrl.pathname).toBe("/auth/login");
    expect(finalUrl.searchParams.get("redirect")).toBe("/app/housing");
    await expect(page.getByRole("heading", { name: "Добро пожаловать" })).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});
