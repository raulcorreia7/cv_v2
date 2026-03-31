import { readFile, writeFile } from "node:fs/promises";

import { resolveConfig, type BuildConfig } from "./config";

type ResumePalette = {
  accent: string;
  accentSoft: string;
  borderSoft: string;
};

type LayoutSection =
  | "about"
  | "awards"
  | "education"
  | "interests"
  | "languages"
  | "projects"
  | "references"
  | "skills"
  | "summary"
  | "volunteer"
  | "work";

type LayoutToken = LayoutSection | `${"work"}:${string}`;

type LayoutPage = {
  header?: boolean;
  id: string;
  left?: LayoutToken[];
  right?: LayoutToken[];
};

type WorkItem = {
  "x-layout"?: {
    page?: string;
  };
};

type ResumeDocument = {
  basics?: {
    summary?: string;
  };
  meta?: {
    "x-layout"?: {
      pages?: LayoutPage[];
    };
  };
  work?: WorkItem[];
};

const sectionRegistry: Record<LayoutSection, { className: string; tagName: "div" }> = {
  about: { className: "about-container", tagName: "div" },
  awards: { className: "awards-container", tagName: "div" },
  education: { className: "education-container", tagName: "div" },
  interests: { className: "interests-container", tagName: "div" },
  languages: { className: "languages-container", tagName: "div" },
  projects: { className: "project-container", tagName: "div" },
  references: { className: "references-container", tagName: "div" },
  skills: { className: "skills-container", tagName: "div" },
  summary: { className: "summary-container", tagName: "div" },
  volunteer: { className: "volunteer-container", tagName: "div" },
  work: { className: "work-container", tagName: "div" },
};

const defaultPages: LayoutPage[] = [
  {
    id: "core",
    header: true,
    left: ["about", "skills", "languages", "interests"],
    right: ["summary", "work:all"],
  },
  {
    id: "secondary",
    header: false,
    left: [],
    right: ["projects", "education", "awards"],
  },
];

const resumePalettes = {
  original: {
    accent: "#56817A",
    accentSoft: "#edf4f3",
    borderSoft: "#d8e6e3",
  },
  "slate-blue": {
    accent: "#3f5f7a",
    accentSoft: "#edf3f7",
    borderSoft: "#d7e2ea",
  },
  "slate-green": {
    accent: "#4c6b68",
    accentSoft: "#eef4f3",
    borderSoft: "#d9e4e2",
  },
  "deep-ink": {
    accent: "#2f4858",
    accentSoft: "#edf2f4",
    borderSoft: "#d8e0e4",
  },
  "aubergine-grey": {
    accent: "#5b4b5f",
    accentSoft: "#f3eef4",
    borderSoft: "#e2d9e4",
  },
  "bronze-taupe": {
    accent: "#7a5d45",
    accentSoft: "#f6f1ec",
    borderSoft: "#e8ddd2",
  },
  "graphite-navy": {
    accent: "#38485f",
    accentSoft: "#eef1f6",
    borderSoft: "#d9dfe8",
  },
  "oxford-burgundy": {
    accent: "#6a4752",
    accentSoft: "#f4eef0",
    borderSoft: "#e6d9dd",
  },
  "steel-teal": {
    accent: "#41666a",
    accentSoft: "#edf4f4",
    borderSoft: "#d8e5e5",
  },
  "charcoal-blue": {
    accent: "#405166",
    accentSoft: "#eef2f6",
    borderSoft: "#dae1e9",
  },
} satisfies Record<string, ResumePalette>;

function resolvePalette(colorVariant: string): ResumePalette {
  return resumePalettes[colorVariant] ?? resumePalettes.original;
}

const escapeHtml = (value: unknown): string =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function sliceBalancedTag(source: string, tagName: string, startIndex: number): string {
  const tagPattern = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "g");
  tagPattern.lastIndex = startIndex;

  let depth = 0;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(source)) !== null) {
    const token = match[0];

    if (token.startsWith(`</${tagName}`)) {
      depth -= 1;

      if (depth === 0) {
        return source.slice(startIndex, match.index + token.length);
      }

      continue;
    }

    depth += 1;
  }

  throw new Error(`Unable to find closing tag for <${tagName}>.`);
}

function sliceElementByMarker(source: string, tagName: string, marker: string): string | null {
  const markerIndex = source.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const startIndex = source.lastIndexOf(`<${tagName}`, markerIndex);

  if (startIndex === -1) {
    return null;
  }

  return sliceBalancedTag(source, tagName, startIndex);
}

function innerHtml(element: string, tagName: string): string {
  const start = element.indexOf(">");
  const end = element.lastIndexOf(`</${tagName}>`);

  if (start === -1 || end === -1) {
    throw new Error(`Unable to extract inner HTML for <${tagName}>.`);
  }

  return element.slice(start + 1, end);
}

function rebuildContainerWithItems(containerHtml: string, items: string[]): string {
  const start = containerHtml.indexOf(">");
  const end = containerHtml.lastIndexOf("</div>");

  if (start === -1 || end === -1) {
    return containerHtml;
  }

  const inner = containerHtml.slice(start + 1, end);
  const firstItemIndex = inner.indexOf('<section class="item">');
  const prefix = firstItemIndex === -1 ? inner : inner.slice(0, firstItemIndex);

  if (items.length === 0) {
    return "";
  }

  return `${containerHtml.slice(0, start + 1)}${prefix}${items.join("\n")}</div>`;
}

function splitContainerItems(containerHtml: string): string[] {
  return [...containerHtml.matchAll(/<section class="item">[\s\S]*?<\/section>/g)].map((match) => match[0]);
}

function classifyWorkItem(itemHtml: string, bucket: string, index: number): string {
  return itemHtml.replace(
    '<section class="item">',
    `<section class="item item--${bucket}" data-work-bucket="${bucket}" data-work-index="${index + 1}">`,
  );
}

function limitWorkItemBullets(itemHtml: string, maxItems: number): string {
  return itemHtml.replace(/<ul>[\s\S]*?<\/ul>/, (listHtml) => {
    const items = [...listHtml.matchAll(/<li>[\s\S]*?<\/li>/g)].map((match) => match[0]);

    if (items.length <= maxItems) {
      return listHtml;
    }

    return `<ul>${items.slice(0, maxItems).join("")}</ul>`;
  });
}

function classifyWorkContainer(containerHtml: string, bucket: string): string {
  return containerHtml.replace(
    'class="container work-container"',
    `class="container work-container work-container--${bucket}" data-work-bucket="${bucket}"`,
  );
}

function renderWorkBucket(sectionMap: Partial<Record<LayoutSection, string>>, resume: ResumeDocument, bucket: string): string {
  const workContainer = sectionMap.work;

  if (!workContainer) {
    return "";
  }

  const renderedItems = splitContainerItems(workContainer);
  const selectedItems = renderedItems
    .map((itemHtml, index) => {
      const itemBucket = resume.work?.[index]?.["x-layout"]?.page ?? "secondary";

      if (bucket !== "all" && itemBucket !== bucket) {
        return null;
      }

      const limitedItemHtml = bucket === "all" && itemBucket === "secondary" ? limitWorkItemBullets(itemHtml, 2) : itemHtml;

      return classifyWorkItem(limitedItemHtml, itemBucket, index);
    })
    .filter((itemHtml): itemHtml is string => Boolean(itemHtml));

  return rebuildContainerWithItems(classifyWorkContainer(workContainer, bucket), selectedItems);
}

function renderToken(
  sectionMap: Partial<Record<LayoutSection, string>>,
  resume: ResumeDocument,
  token: LayoutToken,
): string {
  if (token.startsWith("work:")) {
    return renderWorkBucket(sectionMap, resume, token.slice("work:".length));
  }

  return sectionMap[token] ?? "";
}

function collectSections(
  sectionMap: Partial<Record<LayoutSection, string>>,
  resume: ResumeDocument,
  sections: LayoutToken[],
): string {
  return sections.map((section) => renderToken(sectionMap, resume, section)).filter(Boolean).join("\n");
}

function buildPage(page: LayoutPage, headerHtml: string, leftHtml: string, rightHtml: string): string {
  const hasLeftColumn = leftHtml.trim().length > 0;

  return `<section class="page page--${page.id}">
${page.header === false ? "" : `${headerHtml}\n`}  <div class="resume-content${hasLeftColumn ? "" : " resume-content--single"}">
    ${hasLeftColumn ? `<aside class="left-column">
${leftHtml}
    </aside>` : ""}
    <div class="right-column${hasLeftColumn ? "" : " right-column--full"}">
${rightHtml}
    </div>
  </div>
</section>`;
}

function normalizeThemeHtml(source: string): string {
  return source.replace(
    /(<div class="container about-container">[\s\S]*?)<\/section>(\s*<div class="skills-container">)/,
    "$1</div>$2",
  );
}

function formatSummaryTechLines(source: string): string {
  return source.replace(
    /<p class="summary">([\s\S]*?)\s\|\|\s([\s\S]*?)<\/p>(\s*<ul>[\s\S]*?<\/ul>)?/g,
    (_match, summaryText: string, techText: string, listHtml = "") => {
      const formattedTechText = techText.trim().replace(/,\s+/g, " · ");

      return `<p class="summary">${summaryText.trim()}</p><p class="summary-tech">${formattedTechText}</p>${listHtml}`;
    },
  );
}

function formatProjectTechLines(source: string): string {
  return source.replace(
    /(<\/h4>)\s*<div class="flex-container">([\s\S]*?)<\/div>/g,
    (_match, headingClose: string, skillsHtml: string) => {
      const skills = [...skillsHtml.matchAll(/<h6 class="skill">([\s\S]*?)<\/h6>/g)]
        .map((skillMatch) => skillMatch[1].trim())
        .filter(Boolean);

      if (skills.length === 0) {
        return _match;
      }

      return `${headingClose}\n                    <p class="summary-tech summary-tech--project">${skills.join(" · ")}</p>`;
    },
  );
}

function stripRemoteFontFaces(source: string): string {
  return source.replace(/@font-face\s*\{[\s\S]*?\}\s*/g, "");
}

function applyExplicitPageLayout(source: string, resume: ResumeDocument, pages: LayoutPage[]): string {
  const main = sliceElementByMarker(source, "main", 'id="resume"');

  if (!main) {
    return source;
  }

  const header = sliceElementByMarker(main, "header", "resume-header");

  if (!header) {
    return source;
  }

  const sectionMap = Object.fromEntries(
    Object.entries(sectionRegistry).map(([section, definition]) => [
      section,
      sliceElementByMarker(main, definition.tagName, definition.className) ?? "",
    ]),
  ) as Partial<Record<LayoutSection, string>>;
  const renderedPages = pages
    .map((page) =>
      buildPage(
        page,
        header,
        collectSections(sectionMap, resume, page.left ?? []),
        collectSections(sectionMap, resume, page.right ?? []),
      ),
    )
    .join("\n");
  const replacement = `<main id="resume" class="resume-stack">
${renderedPages}
</main>`;

  return source.replace(main, replacement);
}

function buildPrintFixStyles(palette: ResumePalette): string {
  return `
<style data-resume-print-fixes>
  :root {
    --resume-font-body: "Aptos", "Segoe UI", "Noto Sans", "Liberation Sans", Arial, sans-serif;
    --resume-font-heading: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Noto Serif", "Liberation Serif", Georgia, serif;
    --resume-font-ui: "Aptos", "Segoe UI", "Noto Sans", "Liberation Sans", Arial, sans-serif;
    --resume-text: #23343c;
    --resume-muted: #5c6d75;
    --resume-accent: ${palette.accent};
    --resume-accent-soft: ${palette.accentSoft};
    --resume-border-soft: ${palette.borderSoft};
  }

  body,
  #resume.resume-stack,
  #resume.resume-stack p,
  #resume.resume-stack li,
  #resume.resume-stack .summary,
  #resume.resume-stack .skill,
  #resume.resume-stack .info-text {
    font-family: var(--resume-font-body);
    letter-spacing: 0;
    font-kerning: normal;
    font-variant-ligatures: none;
  }

  #resume.resume-stack,
  #resume.resume-stack a,
  #resume.resume-stack p,
  #resume.resume-stack li {
    color: var(--resume-text);
  }

  #resume.resume-stack a:hover {
    color: var(--resume-accent);
  }

  #resume.resume-stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  #resume.resume-stack .page {
    width: 202mm;
    margin: 0 auto;
    padding: 8px 3mm 6px;
    border-top-color: var(--resume-accent);
  }

  #resume.resume-stack .page .resume-header,
  #resume.resume-stack .page .resume-content {
    padding: 0;
  }

  #resume.resume-stack .left-column {
    width: 118px;
    margin-right: 8px;
  }

  #resume.resume-stack .container {
    padding-top: 6px;
  }

  #resume.resume-stack .item {
    margin-bottom: 4px;
  }

  .profile-pic {
    margin-top: 0;
    margin-right: 0;
  }

  .profile-pic img {
    display: block;
    object-fit: cover;
    object-position: center;
    width: 44px;
    height: 44px;
    border: 2px solid var(--resume-accent);
  }

  .section-header .sublink {
    display: none;
  }

  #resume.resume-stack .section-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  #resume.resume-stack .section-header .pull-left,
  #resume.resume-stack .section-header .pull-right {
    float: none;
  }

  #resume.resume-stack .section-header .pull-left {
    flex: 1 1 auto;
    min-width: 0;
    max-width: none;
  }

  #resume.resume-stack .section-header .pull-right {
    flex: 0 0 auto;
    white-space: nowrap;
    text-align: right;
  }

  #resume.resume-stack h1 {
    font-family: var(--resume-font-heading);
    font-weight: 700;
    font-size: 34px;
    letter-spacing: 0.2px;
    line-height: 0.96;
    color: #1f3139;
  }

  #resume.resume-stack h2 {
    font-family: var(--resume-font-ui);
    font-weight: 500;
    font-size: 14.8px;
    line-height: 1.1;
    letter-spacing: 0;
    color: var(--resume-muted);
  }

  #resume.resume-stack .title h3 {
    font-family: var(--resume-font-ui);
    font-weight: 700;
    font-size: 11.8px;
    line-height: 1.05;
    letter-spacing: 0.45px;
    text-transform: uppercase;
    color: var(--resume-accent);
  }

  #resume.resume-stack .keyline {
    width: 42px;
    margin: 4px 0 6px;
    border-top-color: var(--resume-accent);
  }

  #resume.resume-stack .fa {
    color: var(--resume-accent);
  }

  #resume.resume-stack .section-header h3,
  #resume.resume-stack .section-header h3 a {
    font-family: var(--resume-font-ui);
    font-weight: 700;
    font-size: 12px;
    line-height: 1.08;
    color: #24353d;
  }

  #resume.resume-stack h4 {
    font-family: var(--resume-font-ui);
    font-weight: 600;
    font-size: 10.5px;
    line-height: 1.14;
    color: var(--resume-muted);
  }

  #resume.resume-stack h5 {
    font-family: var(--resume-font-ui);
    font-weight: 500;
    font-size: 8.7px;
    line-height: 1.08;
    color: var(--resume-muted);
  }

  #resume.resume-stack h6,
  #resume.resume-stack p,
  #resume.resume-stack li {
    font-size: 10px;
    line-height: 1.21;
  }

  #resume.resume-stack .summary {
    line-height: 1.26;
    color: #31454d;
  }

  #resume.resume-stack .about-container .info-text,
  #resume.resume-stack .languages-container li,
  #resume.resume-stack .interests-container li {
    color: #31454d;
  }

  #resume.resume-stack .skill {
    display: inline-block;
    padding: 0.04em 0.24em;
    border: 1px solid var(--resume-border-soft);
    border-radius: 999px;
    background: var(--resume-accent-soft);
    color: #2f4443;
    font-size: 7.2px;
    font-weight: 500;
    line-height: 1.12;
  }

  #resume.resume-stack .left-column .title h3 {
    margin-bottom: 0;
  }

  #resume.resume-stack .work-container--all .item--secondary {
    margin-bottom: 2px;
  }

  #resume.resume-stack .work-container--all .item--secondary .section-header {
    margin-bottom: 0;
  }

  #resume.resume-stack .work-container--all .item--secondary h4 {
    margin-bottom: 1px;
  }

  #resume.resume-stack .work-container--all .item--secondary .summary {
    margin-top: 1px;
    max-width: 96%;
    font-size: 8.95px;
    line-height: 1.18;
  }

  #resume.resume-stack .left-column .container {
    padding-top: 6px;
  }

  #resume.resume-stack .left-column .title h3 {
    font-size: 10px;
    line-height: 1.08;
    letter-spacing: 0.38px;
  }

  #resume.resume-stack .left-column .keyline {
    width: 32px;
    margin: 3px 0 4px;
  }

  #resume.resume-stack .left-column .info-tag-container {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    margin-bottom: 2px;
  }

  #resume.resume-stack .left-column .info-tag-container .fa {
    width: 9px;
    margin-right: 0;
    font-size: 9px;
    line-height: 1.2;
  }

  #resume.resume-stack .left-column .info-tag-container .info-text {
    width: auto;
    max-width: 118px;
    line-height: 1.16;
  }

  #resume.resume-stack .left-column h6,
  #resume.resume-stack .left-column li,
  #resume.resume-stack .left-column .info-text {
    font-size: 7.8px;
    line-height: 1.16;
  }

  #resume.resume-stack .left-column .flex-container {
    gap: 2px 3px;
  }

  #resume.resume-stack .left-column .skills-container .minimal.flex-container {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    position: relative;
    column-gap: 10px;
    row-gap: 3px;
    margin-top: 0;
    padding-left: 0;
  }

  #resume.resume-stack .left-column .skills-container .minimal.flex-container::before {
    content: "";
    position: absolute;
    top: 1px;
    bottom: 1px;
    left: calc(50% - 0.5px);
    border-left: 1px solid var(--resume-border-soft);
  }

  #resume.resume-stack .left-column .skills-container .main-skill.skill {
    display: block;
    width: auto;
    max-width: 100%;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: #31454d;
    font-size: 7.6px;
    line-height: 1.16;
  }

  #resume.resume-stack .left-column .languages-container ul,
  #resume.resume-stack .left-column .interests-container {
    margin-top: 0;
  }

  #resume.resume-stack .left-column .languages-container ul {
    padding-left: 0;
    list-style: none;
  }

  #resume.resume-stack .left-column .languages-container li {
    margin-bottom: 2px;
  }

  #resume.resume-stack .left-column .languages-container h6 {
    display: grid;
    grid-template-columns: 52px max-content;
    align-items: baseline;
    column-gap: 4px;
    font-size: 7.7px;
    line-height: 1.18;
    font-weight: 600;
    color: #2f4443;
  }

  #resume.resume-stack .left-column .languages-container em {
    margin-left: 0;
    white-space: nowrap;
    font-style: normal;
    font-weight: 400;
    color: var(--resume-muted);
  }

  #resume.resume-stack .left-column .interests-container .item {
    margin-bottom: 2px;
  }

  #resume.resume-stack .left-column .interests-container h4 {
    color: #2f4443;
    font-size: 7.7px;
    line-height: 1.18;
    font-weight: 600;
  }

  #resume.resume-stack .container {
    padding-top: 6px;
  }

  #resume.resume-stack ul {
    margin-top: 1px;
    margin-bottom: 0;
    padding-left: 14px;
  }

  #resume.resume-stack .item {
    margin-bottom: 4px;
  }

  #resume.resume-stack .summary,
  #resume.resume-stack .work-container .summary,
  #resume.resume-stack .awards-container .summary {
    margin: 1px 0 0;
  }

  #resume.resume-stack .keyline {
    margin: 4px 0 5px;
  }

  #resume.resume-stack .work-container .section-header {
    margin-bottom: 2px;
  }

  #resume.resume-stack .work-container .section-header .pull-left {
    padding-right: 8px;
  }

  #resume.resume-stack .work-container h4 {
    font-size: 9.7px;
    line-height: 1.16;
    margin-bottom: 2px;
  }

  #resume.resume-stack .work-container .summary {
    font-size: 9.3px;
    line-height: 1.2;
  }

  #resume.resume-stack .work-container .summary-tech,
  #resume.resume-stack .page--secondary .project-container .summary-tech {
    margin: 2px 0 0;
    font-family: var(--resume-font-ui);
    font-size: 7.8px;
    font-weight: 400;
    line-height: 1.14;
    letter-spacing: 0.08px;
    color: var(--resume-muted);
  }

  #resume.resume-stack .work-container .summary-tech {
    margin-bottom: 2px;
  }

  #resume.resume-stack .work-container ul {
    margin-top: 2px;
    padding-left: 12px;
  }

  #resume.resume-stack .work-container ul li {
    padding-left: 3px;
    margin-bottom: 2px;
  }

  #resume.resume-stack .work-container .item {
    margin-bottom: 7px;
  }

  #resume.resume-stack .work-container .item + .item {
    border-top: 1px solid var(--resume-border-soft);
    padding-top: 6px;
  }

  #resume.resume-stack .work-container .item:last-child {
    margin-bottom: 0;
  }

  #resume.resume-stack .page--secondary .awards-container .item {
    margin-bottom: 6px;
  }

  #resume.resume-stack .page--secondary .container {
    padding-top: 10px;
  }

  #resume.resume-stack .page--secondary .title h3 {
    font-size: 11.9px;
    letter-spacing: 0.5px;
  }

  #resume.resume-stack .page--secondary .section-header .pull-right {
    width: 74px;
  }

  #resume.resume-stack .page--secondary .section-header .pull-left {
    max-width: calc(100% - 86px);
  }

  #resume.resume-stack .page--secondary .keyline {
    margin: 4px 0 7px;
  }

  #resume.resume-stack .page--secondary .project-container .item {
    margin-bottom: 10px;
    padding-bottom: 3px;
  }

  #resume.resume-stack .page--secondary .project-container .item + .item {
    border-top: 1px solid var(--resume-border-soft);
    padding-top: 6px;
  }

  #resume.resume-stack .page--secondary .project-container .item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
  }

  #resume.resume-stack .page--secondary .project-container .section-header {
    margin-bottom: 2px;
  }

  #resume.resume-stack .page--secondary .project-container .section-header .pull-left {
    padding-right: 10px;
  }

  #resume.resume-stack .page--secondary .project-container h4 {
    margin-top: 1px;
    margin-bottom: 4px;
    font-size: 9.45px;
    font-weight: 500;
    line-height: 1.24;
    color: #31454d;
  }

  #resume.resume-stack .page--secondary .project-container .summary-tech {
    margin-top: 3px;
  }

  #resume.resume-stack .page--secondary .education-container .item,
  #resume.resume-stack .page--secondary .awards-container .item {
    margin-bottom: 7px;
  }

  #resume.resume-stack .page--secondary .education-container .item {
    margin-bottom: 0;
    padding: 2px 0 0;
    border-left: 0;
    background: transparent;
  }

  #resume.resume-stack .page--secondary .education-container .section-header {
    margin-bottom: 1px;
  }

  #resume.resume-stack .page--secondary .education-container .section-header h3 {
    font-size: 10.8px;
    line-height: 1.1;
  }

  #resume.resume-stack .page--secondary .education-container h4 {
    margin-top: 1px;
    font-size: 9.35px;
    font-weight: 500;
    line-height: 1.18;
    color: #31454d;
  }

  #resume.resume-stack .page--secondary .education-container h5 {
    margin-top: 2px;
    font-size: 8.45px;
    font-weight: 500;
    line-height: 1.16;
    color: var(--resume-muted);
  }

  #resume.resume-stack .page--secondary .awards-container .summary,
  #resume.resume-stack .page--secondary .awards-container .awarder {
    margin: 2px 0 0;
  }

  #resume.resume-stack .page--secondary .interests-container {
    padding-top: 8px;
  }

  #resume.resume-stack .page--secondary .interests-container .item {
    display: inline-block;
    width: calc(50% - 8px);
    margin-bottom: 4px;
    vertical-align: top;
  }

  #resume.resume-stack .page--core .resume-header {
    margin-bottom: 2px;
  }

  #resume.resume-stack .page--core h1 {
    font-size: 35px;
  }

  #resume.resume-stack .page--core h2 {
    font-size: 15.1px;
  }

  #resume.resume-stack .page--core .left-column .container {
    padding-top: 7px;
  }

  #resume.resume-stack .page--core .left-column .title h3 {
    font-size: 10.2px;
  }

  #resume.resume-stack .page--core .left-column h6,
  #resume.resume-stack .page--core .left-column li,
  #resume.resume-stack .page--core .left-column .info-text {
    font-size: 8px;
    line-height: 1.18;
  }

  #resume.resume-stack .page--core .summary {
    font-size: 10.2px;
    line-height: 1.24;
    margin-top: 2px;
  }

  #resume.resume-stack .page--core .work-container .item {
    margin-bottom: 8px;
  }

  #resume.resume-stack .page--core .work-container h4 {
    font-size: 9.9px;
    margin-bottom: 3px;
  }

  #resume.resume-stack .page--core .work-container .summary {
    font-size: 9.5px;
    line-height: 1.22;
  }

  #resume.resume-stack .page--core .work-container ul li {
    margin-bottom: 2px;
  }

  #resume.resume-stack .page--core .work-container--all .item--secondary ul {
    margin-top: 2px;
  }

  #resume.resume-stack .page--core .work-container--all .item--secondary ul li {
    font-size: 8.9px;
    line-height: 1.16;
    margin-bottom: 0;
  }

  @media print {
    @page {
      size: A4;
      margin: 3mm 0 3mm;
    }

    html,
    body {
      background: white;
    }

    body {
      margin: 0;
    }

    #resume.resume-stack {
      display: block;
    }

    #resume.resume-stack .page {
      break-before: page;
      page-break-before: always;
      box-shadow: none;
    }

    #resume.resume-stack .page:first-child {
      break-before: auto;
      page-break-before: auto;
    }

    .container {
      break-inside: auto;
      page-break-inside: auto;
    }

    .work-container,
    .project-container {
      break-inside: auto;
      page-break-inside: auto;
    }

    .about-container,
    .skills-container,
    .languages-container,
    .interests-container {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .left-column .languages-container ul {
      padding-left: 0;
      list-style: none;
    }

    .left-column .languages-container li {
      margin-bottom: 2px;
    }

    .work-container .item,
    .project-container .item,
    .education-container .item,
    .awards-container .item {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .page--secondary .container {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .fa-external-link {
      display: none;
    }
  }
</style>
`;
}

export async function postprocessResume(config: BuildConfig = resolveConfig()): Promise<void> {
  const html = await readFile(config.outputHtml, "utf8");
  const resume = JSON.parse(await readFile(config.resumeJsonPath, "utf8")) as ResumeDocument;
  const printFixStyles = buildPrintFixStyles(resolvePalette(config.colorVariant));

  let nextHtml = html;

  if (!nextHtml.includes("<html lang=")) {
    nextHtml = nextHtml.replace("<html>", '<html lang="en">');
  }

  nextHtml = stripRemoteFontFaces(nextHtml);

  if (!nextHtml.includes('name="description"')) {
    const summary = resume.basics?.summary ? escapeHtml(resume.basics.summary) : "";
    nextHtml = nextHtml.replace(
      "</head>",
      `  <meta name="description" content="${summary}">\n  <meta name="color-scheme" content="light">\n${printFixStyles}\n</head>`,
    );
  }

  nextHtml = normalizeThemeHtml(nextHtml);
  nextHtml = nextHtml.replace(/<span class="sublink">[\s\S]*?<\/span>/g, "");
  nextHtml = applyExplicitPageLayout(nextHtml, resume, resume.meta?.["x-layout"]?.pages ?? defaultPages);
  nextHtml = formatSummaryTechLines(nextHtml);
  nextHtml = formatProjectTechLines(nextHtml);

  await writeFile(config.outputHtml, nextHtml, "utf8");
}
