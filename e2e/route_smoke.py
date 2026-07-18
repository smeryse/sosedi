from playwright.sync_api import sync_playwright


ROUTES = [
    "/", "/about", "/safety", "/faq", "/auth/login", "/auth/sign-up", "/app",
    "/app/roommates", "/app/roommates/maria", "/app/roommates/compare", "/app/housing",
    "/app/housing/center-loft", "/app/group", "/app/group/create", "/app/group/replacement", "/app/applications",
    "/app/applications/application-34872", "/app/messages", "/app/messages/maria",
    "/app/budget", "/app/chores", "/app/compatibility", "/app/assistant", "/app/profile",
    "/app/settings", "/app/notifications", "/owner", "/owner/properties", "/owner/applications",
    "/owner/properties/center-loft", "/owner/properties/center-loft/edit", "/owner/applications/application-34872", "/owner/messages", "/owner/analytics", "/owner/profile", "/owner/settings",
]


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        for route in ROUTES:
            response = page.goto(f"http://127.0.0.1:3123{route}", wait_until="domcontentloaded")
            status = response.status if response else 0
            if status >= 400:
                raise RuntimeError(f"{route} returned {status}")
            if not page.locator("body").inner_text().strip():
                raise RuntimeError(f"{route} rendered an empty body")
            print(route, status, page.title())
        browser.close()


if __name__ == "__main__":
    main()
