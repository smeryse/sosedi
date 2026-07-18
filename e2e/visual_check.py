from pathlib import Path

from playwright.sync_api import sync_playwright


def main() -> None:
    output = Path("/tmp/sosedi-visual-check")
    output.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        for name, width, height in (("desktop", 1440, 900), ("mobile", 390, 844)):
            page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
            page.on("console", lambda message: print(f"console:{message.type}:{message.text}"))
            page.goto("http://127.0.0.1:3123/app", wait_until="networkidle")
            page.screenshot(path=str(output / f"dashboard-{name}.png"), full_page=True)
            print(name, page.title(), page.locator("h1").inner_text())
            print("links", page.locator("a").count(), "images", page.locator("img").count())
            page.close()
        browser.close()


if __name__ == "__main__":
    main()
