import { readFile } from "node:fs/promises";

/**
 * House-style check for the CV and cover letter sources. Runs before the PDF export so
 * a defect cannot reach a shared copy.
 *
 * It reads the HTML source rather than the exported PDF, so it catches wording and date
 * rules, not font or layout problems. Verify layout by opening the export.
 */

const FILES = ["src/resume.html", "src/cover-letter.html"];

const decode = (text: string): string =>
  text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const visibleText = (line: string): string => decode(line.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

type Rule = { name: string; test: (text: string) => string | null };

const RULES: Rule[] = [
  { name: "doubled word", test: (t) => t.match(/\b(\w{2,})\s+\1\b/i)?.[0] ?? null },
  { name: "double space", test: (t) => (/\S {2,}\S/.test(t) ? "two or more spaces" : null) },
  { name: "dash style", test: (t) => t.match(/[—–]|\s--\s/)?.[0] ?? null },
  {
    name: "duty phrasing",
    test: (t) => t.match(/\b(responsible for|in charge of|duties included|helped to|tasked with)\b/i)?.[0] ?? null,
  },
];

const VALID_DATE = /^(\d{2}\/\d{4} - (\d{2}\/\d{4}|Present)|\d{4})$/;

const BALANCED_TAGS = ["div", "section", "article", "aside", "main", "ul", "p", "h1", "h2", "h3", "h4", "h5", "dl"];

const findings: string[] = [];

for (const file of FILES) {
  const source = await readFile(file, "utf8");
  const lines = source.split("\n");
  let inStyle = false;

  lines.forEach((line, index) => {
    if (/<style\b/.test(line)) {
      inStyle = true;
    }

    const closesStyle = /<\/style>/.test(line);
    const text = inStyle ? "" : visibleText(line);

    if (text) {
      for (const rule of RULES) {
        const hit = rule.test(text);

        if (hit) {
          findings.push(`${file}:${index + 1}  ${rule.name}: "${hit}"  in  ${text.slice(0, 90)}`);
        }
      }
    }

    // entity check reads the raw line, since decoding hides an unescaped ampersand
    if (!inStyle) {
      const raw = line.match(/&(?!(amp|lt|gt|quot|#39|nbsp);)/)?.[0];

      if (raw) {
        findings.push(`${file}:${index + 1}  unescaped ampersand in  ${line.trim().slice(0, 90)}`);
      }
    }

    if (closesStyle) {
      inStyle = false;
    }
  });

  // date elements must hold a date, not free text
  for (const [index, match] of [...source.matchAll(/<p class="entry__dates">([^<]*)<\/p>/g)].entries()) {
    const value = decode(match[1]).trim();

    if (/\d/.test(value) && !VALID_DATE.test(value)) {
      findings.push(`${file}  entry date ${index + 1}: "${value}" is not MM/YYYY - MM/YYYY, MM/YYYY - Present, or YYYY`);
    }
  }

  // structural damage from a bad edit shows up here before it reaches the export
  for (const tag of BALANCED_TAGS) {
    const open = source.match(new RegExp(`<${tag}\\b`, "g"))?.length ?? 0;
    const close = source.match(new RegExp(`</${tag}>`, "g"))?.length ?? 0;

    if (open !== close) {
      findings.push(`${file}  unbalanced <${tag}>: ${open} open, ${close} close`);
    }
  }
}

if (findings.length > 0) {
  console.error(`copy check failed (${findings.length}):`);
  for (const finding of findings) {
    console.error(`  ${finding}`);
  }
  process.exit(1);
}

console.log(`copy check passed (${FILES.length} files)`);
