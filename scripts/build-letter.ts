import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { resolveConfig, type BuildConfig } from "./config";

const escapeHtml = (value: unknown): string =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export async function buildCoverLetterHtml(config: BuildConfig = resolveConfig()): Promise<void> {
  const inputPath = config.coverLetterFile;
  const outputDir = config.outputDir;
  const outputHtml = config.outputLetterHtml;
  const data = JSON.parse(await readFile(inputPath, "utf8"));

  const name = data.name || "";
  const title = data.title || "";
  const date = data.date || "";
  const recipient = data.recipient || "";
  const company = data.company || "";
  const role = data.role || "";
  const showMeta = data.showMeta !== false;
  const greeting = data.greeting || "Dear Hiring Manager,";
  const body = Array.isArray(data.body) ? data.body : [];
  const closing = data.closing || "Kind regards,";
  const signature = data.signature || name;

  const contactParts: string[] = [];
  if (data.contact?.email) contactParts.push(data.contact.email);
  if (data.contact?.phone) contactParts.push(data.contact.phone);
  if (data.contact?.location) contactParts.push(data.contact.location);
  if (data.contact?.linkedin) contactParts.push(data.contact.linkedin);

  const contactHtml = contactParts.map((part) => escapeHtml(part)).join("<br>");
  const reLine =
    role || company ? `Re: ${escapeHtml(role)}${role && company ? " - " : ""}${escapeHtml(company)}` : "";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>${escapeHtml(name)} - Cover Letter</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
      href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;700&family=Lato:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap"
      rel="stylesheet"
    >
    <style>
      :root {
        --ink: #39424b;
        --muted: #7a828a;
        --accent: #56817a;
        --page-width: 612px;
      }

      * {
        box-sizing: border-box;
      }

      html {
        background: white;
      }

      body {
        margin: 50px 0 100px;
        font-family: "Lato", Helvetica, Arial, sans-serif;
        color: var(--ink);
        background: white;
        letter-spacing: 0.3px;
      }

      .page {
        width: var(--page-width);
        min-height: 792px;
        margin: 0 auto;
        padding: 36px 34px 30px;
        background: white;
        border-top: 10px solid var(--accent);
        box-shadow: 0 1px 10px rgba(0, 0, 0, 0.5);
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 24px;
      }

      .header-copy {
        flex: 1 1 auto;
      }

      .contact {
        flex: 0 0 180px;
        font-size: 11px;
        line-height: 1.55;
        color: var(--muted);
        text-align: right;
        word-break: break-word;
        overflow-wrap: anywhere;
      }

      .name {
        margin: 0;
        font-family: "Josefin Sans", Helvetica, Arial, sans-serif;
        font-size: 40px;
        font-weight: 700;
        letter-spacing: 1px;
      }

      .title {
        margin: 0;
        font-family: "Josefin Sans", Helvetica, Arial, sans-serif;
        font-size: 16px;
        font-weight: 300;
        letter-spacing: 0.5px;
        color: var(--muted);
      }

      .keyline {
        width: 45px;
        margin: 8px 0 14px;
        border-top: 1px solid var(--accent);
      }

      .meta {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        margin-bottom: 12px;
        font-size: 11px;
        color: var(--muted);
      }

      .meta-right {
        text-align: right;
      }

      .reline {
        margin: 2px 0 18px;
        font-size: 12px;
        font-weight: 700;
      }

      .greeting,
      .closing {
        font-size: 12px;
      }

      p {
        margin: 14px 0;
        font-size: 12px;
        line-height: 1.62;
      }

      .closing {
        margin-top: 24px;
      }

      .signature {
        margin-top: 18px;
        font-size: 12px;
        font-weight: 700;
      }

      @media (max-width: 720px) {
        body {
          margin: 0;
        }

        .page {
          width: 100%;
          min-height: auto;
          padding: 28px 22px;
          box-shadow: none;
          border-top-width: 8px;
        }

        .header,
        .meta {
          display: block;
        }

        .contact,
        .meta-right {
          margin-top: 12px;
          text-align: left;
        }
      }

      @media print {
        @page {
          size: A4;
          margin: 8mm 0 10mm;
        }

        body {
          margin: 0;
          background: white;
        }

        .page {
          width: 170mm;
          min-height: auto;
          margin: 0 auto;
          padding: 28px 30px 26px;
          box-shadow: none;
          border-top-width: 8px;
        }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <header class="header">
        <div class="header-copy">
          <h1 class="name">${escapeHtml(name)}</h1>
          ${title ? `<div class="title">${escapeHtml(title)}</div>` : ""}
          <div class="keyline"></div>
        </div>
        ${contactParts.length ? `<div class="contact">${contactHtml}</div>` : ""}
      </header>
      ${
        showMeta && (date || recipient || company)
          ? `<div class="meta">
        <div class="meta-left">${escapeHtml(date)}</div>
        <div class="meta-right">
          ${escapeHtml(recipient)}${recipient && company ? "<br>" : ""}${escapeHtml(company)}
        </div>
      </div>`
          : ""
      }
      ${reLine ? `<div class="reline">${reLine}</div>` : ""}
      <div class="greeting">${escapeHtml(greeting)}</div>
      ${body.map((paragraph: string) => `<p>${escapeHtml(paragraph)}</p>`).join("\n")}
      <div class="closing">
        <div>${escapeHtml(closing)}</div>
        <div class="signature">${escapeHtml(signature)}</div>
      </div>
    </main>
  </body>
</html>`;

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputHtml, html, "utf8");
}
