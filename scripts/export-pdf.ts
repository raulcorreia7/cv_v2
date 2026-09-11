import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { chromium } from "playwright";

import { resolveConfig, type BuildConfig } from "./config";

const isRemote = (value: string): boolean => /^https?:\/\//i.test(value);

export async function exportPdf(config: BuildConfig = resolveConfig()): Promise<void> {
  const input = process.env.PDF_INPUT ?? config.outputHtml;
  const output = process.env.PDF_OUTPUT ?? config.outputPdf;

  if (!isRemote(input)) {
    await access(input).catch(() => {
      throw new Error(`HTML input not found: ${input}. Run the HTML build first.`);
    });
  }

  await mkdir(path.dirname(output), { recursive: true });
  const entryUrl = isRemote(input) ? input : pathToFileURL(path.resolve(input)).href;

  const browser = await chromium.launch({
    executablePath: process.env.CHROME_BIN || undefined,
    headless: true,
    // ponytail: --no-sandbox only as root (stock `docker run`); drop if the image gains a non-root user + SYS_ADMIN caps
    args: typeof process.getuid === "function" && process.getuid() === 0 ? ["--no-sandbox"] : [],
  });

  try {
    const page = await browser.newPage({
      viewport: {
        width: 1440,
        height: 2048,
      },
    });

    await page.goto(entryUrl, {
      waitUntil: "networkidle",
    });

    await page.emulateMedia({
      media: "print",
    });

    await page.evaluate(async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
    });

    await page.pdf({
      path: output,
      format: "A4",
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
      preferCSSPageSize: true,
      printBackground: true,
      scale: 1,
    });
  } finally {
    await browser.close();
  }
}

if (import.meta.main) {
  await exportPdf();
}
