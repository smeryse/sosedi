from playwright.sync_api import sync_playwright


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        page.goto("http://127.0.0.1:3123/app/roommates", wait_until="networkidle")
        page.wait_for_timeout(500)
        favorite = page.get_by_role("button", name="Убрать из избранного").first
        if favorite.count():
            favorite.click()
        page.get_by_role("button", name="Добавить в избранное").first.click()
        page.goto("http://127.0.0.1:3123/app/group/create", wait_until="networkidle")
        page.wait_for_timeout(1000)
        page.get_by_label("Название группы").fill("Тихий дом на троих")
        page.get_by_label("Бюджет группы").fill("96000")
        page.get_by_role("button", name="Создать группу").last.click()
        page.wait_for_timeout(1200)
        if "/app/group" not in page.url or "/app/group/create" in page.url:
            raise RuntimeError(f"group creation stayed at {page.url}: {page.locator('body').inner_text()[:240]}")
        if "Моя группа" not in page.locator("h1").inner_text():
            raise RuntimeError("group creation did not reach the group page")
        page.goto("http://127.0.0.1:3123/app/applications/new?property=center-loft", wait_until="networkidle")
        page.get_by_role("button", name="Отправить заявку").click()
        page.wait_for_timeout(1000)
        if "Заявка отправлена" not in page.locator("body").inner_text():
            raise RuntimeError(f"application submission did not show success state at {page.url}")
        print("demo flow: favorites, group creation and application submission passed")
        browser.close()


if __name__ == "__main__":
    main()
