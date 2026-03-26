import { access, mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

import { resolveConfig, type BuildConfig } from "./config";

function resolveRequestPath(rootDir: string, requestPath: string): string {
  const relativePath = decodeURIComponent(requestPath).replace(/^\/+/, "");
  const absolutePath = path.resolve(rootDir, relativePath);

  if (!absolutePath.startsWith(rootDir)) {
    return path.join(rootDir, "index.html");
  }

  return absolutePath;
}

export async function exportPdf(config: BuildConfig = resolveConfig()): Promise<void> {
  await access(config.outputHtml).catch(() => {
    throw new Error(`HTML input not found: ${config.outputHtml}. Run the HTML build first.`);
  });

  await mkdir(path.dirname(config.outputPdf), { recursive: true });
  const outputRoot = path.resolve(config.outputDir);
  const entryPath = `/${path.relative(outputRoot, path.resolve(config.outputHtml)).split(path.sep).join("/")}`;
  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      const filePath = resolveRequestPath(outputRoot, new URL(request.url).pathname);
      const file = Bun.file(filePath);

      if (!(await file.exists())) {
        return new Response("Not found", { status: 404 });
      }

      return new Response(file, {
        headers: {
          "Cache-Control": "no-cache",
          "Content-Type": file.type || "application/octet-stream",
        },
      });
    },
  });

  const browser = await chromium.launch({
    executablePath: process.env.CHROME_BIN || undefined,
    headless: true,
  });

  try {
    const page = await browser.newPage({
      viewport: {
        width: 1440,
        height: 2048,
      },
    });

    await page.goto(new URL(entryPath, server.url).href, {
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
      path: config.outputPdf,
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
    server.stop(true);
  }
}
