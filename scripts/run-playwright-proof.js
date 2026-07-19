const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Running Playwright E2E verification test...");
const res = spawnSync("npx", ["playwright", "test", "e2e/nvidia-nim-verification.spec.ts", "--project=chromium", "--reporter=list"], {
  encoding: "utf8",
  cwd: process.cwd(),
});

const output = (res.stdout || "") + "\n" + (res.stderr || "");
console.log("Playwright output:\n", output);

const outPath = path.resolve(process.cwd(), "docs/playwright-results.txt");
fs.writeFileSync(outPath, output, "utf8");
console.log(`Results saved to ${outPath}`);
