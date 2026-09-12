import path from "node:path";
import { pathToFileURL } from "node:url";

import { chromium } from "playwright";

const MAX_SHEET_HEIGHT = 1122.5;
const documents = ["tmp/resume.html", "tmp/cover-letter.html"];

const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN || undefined,
  headless: true,
  args: typeof process.getuid === "function" && process.getuid() === 0 ? ["--no-sandbox"] : [],
});

let failed = false;

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 2048 } });

  for (const documentPath of documents) {
    await page.goto(pathToFileURL(path.resolve(documentPath)).href, { waitUntil: "networkidle" });
    await page.evaluate(async () => await document.fonts?.ready);
    const heights = await page.locator(".sheet").evaluateAll((sheets) =>
      sheets.map((sheet) => Number(sheet.getBoundingClientRect().height.toFixed(1))),
    );

    for (const [index, height] of heights.entries()) {
      console.log(`${documentPath} sheet ${index + 1}: ${height}px`);

      if (height > MAX_SHEET_HEIGHT) {
        console.error(`${documentPath} sheet ${index + 1} exceeds ${MAX_SHEET_HEIGHT}px`);
        failed = true;
      }
    }
  }
} finally {
  await browser.close();
}

if (failed) {
  process.exit(1);
}
