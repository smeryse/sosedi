import { expect, test } from "@playwright/test";

test.describe("Public search entry flow", () => {
  test("opens the current housing search through authentication without runtime errors", async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: "Соседи делают жизнь лучше",
      }),
    ).toBeVisible();

    await page.getByRole("main").getByRole("link", { name: "Найти соседей" }).click();
    await page.waitForURL((url) => url.pathname === "/auth/login");

    const finalUrl = new URL(page.url());
    expect(finalUrl.pathname).toBe("/auth/login");
    expect(finalUrl.searchParams.get("redirect")).toBe("/app/roommates");
    await expect(page.getByRole("heading", { name: "Добро пожаловать" })).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
});
