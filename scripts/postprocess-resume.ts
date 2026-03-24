import { readFile, writeFile } from "node:fs/promises";

import { resolveConfig, type BuildConfig } from "./config";

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
    right: ["summary", "work:core"],
  },
  {
    id: "secondary",
    header: false,
    left: [],
    right: ["work:secondary", "projects", "education", "awards"],
  },
];

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

function renderWorkBucket(sectionMap: Partial<Record<LayoutSection, string>>, resume: ResumeDocument, bucket: string): string {
  const workContainer = sectionMap.work;

  if (!workContainer) {
    return "";
  }

  const renderedItems = splitContainerItems(workContainer);
  const selectedItems = renderedItems.filter((_, index) => (resume.work?.[index]?.["x-layout"]?.page ?? "secondary") === bucket);

  return rebuildContainerWithItems(workContainer, selectedItems);
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

const printFixStyles = `
<style data-resume-print-fixes>
  #resume.resume-stack {
    display: flex;
    flex-direction: column;
    gap: 36px;
  }

  #resume.resume-stack .page {
    width: 670px;
    margin: 0 auto;
    padding: 28px 18px 22px 24px;
  }

  #resume.resume-stack .page .resume-header,
  #resume.resume-stack .page .resume-content {
    padding: 0 10px;
  }

  #resume.resume-stack .left-column {
    width: 156px;
    margin-right: 16px;
  }

  #resume.resume-stack .container {
    padding-top: 16px;
  }

  #resume.resume-stack .item {
    margin-bottom: 10px;
  }

  .profile-pic {
    margin-top: 0;
    margin-right: 0;
  }

  .profile-pic img {
    display: block;
    object-fit: cover;
    object-position: center;
  }

  .section-header .sublink {
    display: none;
  }

  @media print {
    @page {
      size: A4;
      margin: 4mm 0 4mm;
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
    }

    #resume.resume-stack .page:first-child {
      break-before: auto;
      page-break-before: auto;
    }

    .page {
      width: 200mm;
      min-height: auto;
      margin: 0 auto;
      padding: 8px 0 6px;
      box-shadow: none;
      border-top-width: 6px;
    }

    .page .resume-header,
    .page .resume-content {
      padding: 0 2px;
    }

    .left-column {
      width: 136px;
      margin-right: 8px;
    }

    .left-column .container {
      padding-top: 6px;
    }

    .left-column .title h3 {
      font-size: 11px;
      line-height: 1.08;
      letter-spacing: 0.2px;
    }

    .left-column .keyline {
      width: 32px;
      margin: 3px 0 4px;
    }

    .left-column .info-tag-container {
      display: flex;
      align-items: flex-start;
      gap: 4px;
      margin-bottom: 2px;
    }

    .left-column .info-tag-container .fa {
      width: 9px;
      margin-right: 0;
      font-size: 9px;
      line-height: 1.2;
    }

    .left-column .info-tag-container .info-text {
      width: auto;
      max-width: 118px;
      line-height: 1.12;
    }

    .left-column h6,
    .left-column li,
    .left-column .info-text {
      font-size: 7.4px;
    }

    .left-column .flex-container {
      gap: 2px 3px;
    }

    .left-column .skill {
      margin: 0 2px 2px 0;
      padding: 0.02em 0.18em;
      font-size: 7.2px;
      line-height: 1.08;
      border-radius: 3px;
      background: #f4f6f7;
    }

    .left-column .languages-container ul,
    .left-column .interests-container {
      margin-top: 0;
    }

    .left-column .languages-container li {
      margin-bottom: 1px;
    }

    .left-column .interests-container .item {
      margin-bottom: 2px;
    }

    .container {
      break-inside: auto;
      page-break-inside: auto;
      padding-top: 6px;
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

    .item {
      margin-bottom: 4px;
    }

    ul {
      margin-top: 1px;
      margin-bottom: 0;
      padding-left: 16px;
    }

    p,
    li {
      font-size: 10px;
      line-height: 1.12;
    }

    h3 {
      font-size: 13px;
    }

    h4 {
      font-size: 10.5px;
    }

    h5 {
      font-size: 9px;
    }

    h6 {
      font-size: 8px;
    }

    .summary,
    .work-container .summary,
    .awards-container .summary {
      margin: 1px 0 0;
    }

    .keyline {
      margin: 4px 0 5px;
    }

    .work-container .item,
    .project-container .item,
    .education-container .item,
    .awards-container .item {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .work-container .section-header {
      margin-bottom: 1px;
    }

    .work-container .section-header .pull-left {
      max-width: calc(100% - 74px);
    }

    .work-container .section-header h3 {
      font-size: 12.3px;
      line-height: 1.04;
    }

    .work-container .section-header h5 {
      font-size: 8.4px;
      line-height: 1.08;
    }

    .work-container h4 {
      font-size: 9.6px;
      line-height: 1.1;
      margin-bottom: 1px;
    }

    .work-container .summary {
      font-size: 8.8px;
      line-height: 1.12;
    }

    .work-container ul {
      padding-left: 15px;
    }

    .work-container ul li {
      padding-left: 6px;
    }

    .page--secondary .awards-container .item {
      margin-bottom: 6px;
    }

    .page--secondary .awards-container .summary,
    .page--secondary .awards-container .awarder {
      margin: 2px 0 0;
    }

    .page--secondary .interests-container {
      padding-top: 8px;
    }

    .page--secondary .interests-container .item {
      display: inline-block;
      width: calc(50% - 8px);
      margin-bottom: 4px;
      vertical-align: top;
    }

    .fa-external-link {
      display: none;
    }
  }
</style>
`;

export async function postprocessResume(config: BuildConfig = resolveConfig()): Promise<void> {
  const html = await readFile(config.outputHtml, "utf8");
  const resume = JSON.parse(await readFile(config.resumeJsonPath, "utf8")) as ResumeDocument;

  let nextHtml = html;

  if (!nextHtml.includes("<html lang=")) {
    nextHtml = nextHtml.replace("<html>", '<html lang="en">');
  }

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

  await writeFile(config.outputHtml, nextHtml, "utf8");
}
