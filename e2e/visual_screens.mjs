import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const out = "/Users/romanmolodyko/sosedi/artifacts/screenshots";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
for (const [width, height] of [[1440, 900], [1600, 900], [1920, 1080]]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  for (const [path, name] of [["/", "landing"], ["/app", "dashboard"], ["/app/housing", "housing"]]) {
    await page.goto(`http://127.0.0.1:3005${path}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${out}/${name}-${width}x${height}.png`, fullPage: false });
    console.log(width, height, path, await page.title(), "console_errors=", errors.length);
  }
  await page.close();
}
await browser.close();
