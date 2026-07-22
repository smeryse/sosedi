import { expect, test } from "@playwright/test";

const retiredEditorPath = "/owner/properties/demo-prop-1/editor";
const currentEditorPath = "/owner/properties/demo-prop-1/edit";

test.describe("Retired owner property editor", () => {
  test("redirects the old editor to the standard property form", async ({
    page,
    request,
  }) => {
    const response = await request.get(retiredEditorPath, {
      headers: { Cookie: "sosedi_session=retired-route-check" },
      maxRedirects: 0,
    });
    const location = response.headers().location;

    expect(response.status()).toBe(308);
    expect(location).toBeTruthy();
    expect(new URL(location!).pathname).toBe(currentEditorPath);

    await page.goto(retiredEditorPath);

    const finalUrl = new URL(page.url());
    expect(finalUrl.pathname).toBe("/auth/login");
    expect(finalUrl.searchParams.get("redirect")).toBe(retiredEditorPath);
    await expect(page.getByRole("heading", { name: "Добро пожаловать" })).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});
