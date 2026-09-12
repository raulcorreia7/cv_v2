import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { coverLetter as defaultCoverLetter } from "../src/data/cover-letter";
import { resume as defaultResume } from "../src/data/resume";
import type { CoverLetterData, DatedEntry, ProjectEntry, ResumeData, WorkEntry } from "../src/data/types";

type RenderOptions = {
  resumeData?: string;
  coverLetterData?: string;
  baseStyles?: string;
  resumeStyles?: string;
  coverLetterStyles?: string;
  outputDir?: string;
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const safeUrl = (value: string, protocols: string[] = ["http:", "https:"]): string => {
  const url = new URL(value);

  if (!protocols.includes(url.protocol)) {
    throw new Error(`Unsupported URL protocol: ${url.protocol}`);
  }

  return escapeHtml(value);
};

const readJson = async <T>(file: string): Promise<T> => {
  const source = await readFile(file, "utf8");
  const data = JSON.parse(source) as T;

  if ((data as { schemaVersion?: number }).schemaVersion !== 1) {
    throw new Error(`${file}: expected schemaVersion 1`);
  }

  return data;
};

const renderDate = (entry: DatedEntry, duration?: string): string => {
  if (!entry.start) {
    return "";
  }

  const range = entry.end ? `${entry.start} - ${entry.end}` : entry.start;
  const durationHtml = duration ? `<span class="entry__duration">${escapeHtml(duration)}</span>` : "";
  return `<p class="entry__dates">${escapeHtml(range)}${durationHtml}</p>`;
};

const renderTech = (items?: string[]): string =>
  items?.length ? `<p class="tech">${items.map(escapeHtml).join(" · ")}</p>` : "";

const renderWork = (entry: WorkEntry): string => `
        <article class="entry">
          <div class="entry__head">
            <h3 class="entry__org"><a href="${safeUrl(entry.url)}" rel="noopener">${escapeHtml(entry.company)}</a></h3>
            ${renderDate(entry, entry.duration)}
          </div>
          <p class="entry__role">${escapeHtml(entry.role)}</p>
          <p class="entry__summary">${escapeHtml(entry.summary)}</p>
          ${renderTech(entry.technologies)}
          <ul class="points">
${entry.highlights.map((item) => `            <li>${escapeHtml(item)}</li>`).join("\n")}
          </ul>
        </article>`;

const renderProject = (entry: ProjectEntry): string => {
  const name = entry.url
    ? `<a href="${safeUrl(entry.url)}" rel="noopener">${escapeHtml(entry.name)}</a>`
    : escapeHtml(entry.name);

  return `
        <article class="entry entry--tight">
          <div class="entry__head">
            <h3 class="entry__org">${name}</h3>
            ${renderDate(entry)}
          </div>
          <p class="entry__role">${escapeHtml(entry.role)}</p>
          <p class="entry__summary">${escapeHtml(entry.summary)}</p>
          ${renderTech(entry.technologies)}
        </article>`;
};

const contactIcons = {
  email: '<svg class="contact__icon" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 3.2h12v8.6H1zM1 3.2l6 4.6 6-4.6" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>',
  phone: '<svg class="contact__icon" viewBox="0 0 14 14" aria-hidden="true"><path d="M5.1 1.4 6.9 4 5.4 5.6a8.6 8.6 0 0 0 4 4L11 8.1l2.6 1.8v2.4c0 .6-.5 1.1-1.1 1.1A10.6 10.6 0 0 1 1.4 2.5c0-.6.5-1.1 1.1-1.1z" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>',
  location: '<svg class="contact__icon" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1.1a3.9 3.9 0 0 0-3.9 3.9c0 2.9 3.9 7.9 3.9 7.9s3.9-5 3.9-7.9A3.9 3.9 0 0 0 7 1.1zm0 5.3a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8z"/></svg>',
  github: '<svg class="contact__icon" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 .9a6.1 6.1 0 0 0-1.9 11.9c.3 0 .4-.1.4-.3v-1.1c-1.7.4-2.1-.8-2.1-.8-.3-.7-.7-.9-.7-.9-.6-.4 0-.4 0-.4.6 0 1 .7 1 .7.6 1 1.5.7 1.8.5 0-.4.2-.7.4-.9-1.3-.1-2.8-.7-2.8-3.1 0-.7.2-1.2.6-1.7-.1-.1-.3-.7.1-1.5 0 0 .5-.2 1.7.6a5.8 5.8 0 0 1 3 0c1.2-.8 1.7-.6 1.7-.6.4.8.2 1.4.1 1.5.4.5.6 1 .6 1.7 0 2.4-1.5 3-2.8 3.1.3.3.4.7.4 1.4v1.7c0 .2.1.3.4.3A6.1 6.1 0 0 0 7 .9z"/></svg>',
  linkedin: '<svg class="contact__icon" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.1 5h2.2v7.9H2.1zM3.2 1.3a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6zM6.4 5h2.1v1.1a2.3 2.3 0 0 1 2.1-1.2c2 0 2.7 1.2 2.7 3.2v4.8h-2.2V8.5c0-1-.2-1.7-1.2-1.7s-1.4.6-1.4 1.6v4.5H6.4z"/></svg>',
} as const;

const contactRow = (icon: keyof typeof contactIcons, text: string, url?: string): string => {
  const value = url
    ? `<a href="${safeUrl(url, ["http:", "https:", "mailto:"])}" rel="noopener">${escapeHtml(text)}</a>`
    : escapeHtml(text);
  return `<div class="contact">${contactIcons[icon]}<span class="contact__value">${value}</span></div>`;
};

const section = (title: string, body: string): string => `
        <section class="block">
          <h2 class="block__title">${escapeHtml(title)}</h2>
          <div class="keyline"></div>
${body}
        </section>`;

const renderResumeMain = async (data: ResumeData): Promise<string> => {
  const photo = await readFile(data.basics.photo);
  const photoUri = `data:image/jpeg;base64,${photo.toString("base64")}`;
  const mainWork = data.work.filter((entry) => entry.page === "main").map(renderWork).join("");
  const moreWork = data.work.filter((entry) => entry.page === "more").map(renderWork).join("");
  const about = [
    contactRow("email", data.basics.email, `mailto:${data.basics.email}`),
    contactRow("phone", data.basics.phone),
    contactRow("location", data.basics.location),
    contactRow("github", new URL(data.basics.github).host + new URL(data.basics.github).pathname, data.basics.github),
    contactRow("linkedin", new URL(data.basics.linkedin).host + new URL(data.basics.linkedin).pathname, data.basics.linkedin),
  ].join("\n          ");
  const skills = data.skills
    .map((group) => section(group.name, `          <ul class="skills">\n${group.items.map((item) => `            <li>${escapeHtml(item)}</li>`).join("\n")}\n          </ul>`))
    .join("");
  const languages = data.languages
    .map((item) => `            <dt>${escapeHtml(item.name)}</dt><dd>${escapeHtml(item.level)}</dd>`)
    .join("\n");
  const interests = data.interests.map((item) => `            <li>${escapeHtml(item)}</li>`).join("\n");
  const projects = data.projects.map(renderProject).join("");
  const education = data.education
    .map((entry) => `
            <article class="entry entry--tight">
              <div class="entry__head">
                <h3 class="entry__org">${escapeHtml(entry.institution)}</h3>
                ${renderDate(entry)}
              </div>
              <p class="entry__summary">${escapeHtml(entry.qualification)}</p>
              <p class="tech">${escapeHtml(entry.grade)}</p>
            </article>`)
    .join("");
  const awards = data.awards
    .map((entry) => `
            <article class="entry entry--tight">
              <div class="entry__head">
                <h3 class="entry__org">${escapeHtml(entry.name)}</h3>
                <p class="entry__dates">${escapeHtml(entry.date)}</p>
              </div>
              <p class="entry__summary">${escapeHtml(entry.awarder)}</p>
              <p class="tech">${escapeHtml(entry.summary)}</p>
            </article>`)
    .join("");

  return `<main class="resume">
  <section class="sheet sheet--main">
    <header class="hero">
      <div>
        <h1 class="hero__name">${escapeHtml(data.basics.name)}</h1>
        <p class="hero__label">${escapeHtml(data.basics.label)}</p>
      </div>
      <img class="hero__photo" src="${photoUri}" alt="" width="44" height="44">
    </header>
    <div class="sheet__body">
      <div class="main">
${section("Summary", `          <p class="main__summary">${escapeHtml(data.basics.summary)}</p>`)}
${section("Experience", `          <div class="entries">${mainWork}\n          </div>`)}
      </div>
      <aside class="rail">
${section("About", `          ${about}`)}
${skills}
${section("Languages", `          <dl class="languages">\n${languages}\n          </dl>`)}
${section("Interests", `          <ul class="interests">\n${interests}\n          </ul>`)}
      </aside>
    </div>
  </section>
  <section class="sheet sheet--more">
    <div class="sheet__body sheet__body--single">
      <div class="main">
${section("Experience", `          <div class="grid2">${moreWork}\n          </div>`)}
${section("Projects", `          <div class="grid2">${projects}\n          </div>`)}
${section("Education", `          <div class="entries">${education}\n          </div>`)}
${section("Awards", `          <div class="entries">${awards}\n          </div>`)}
      </div>
    </div>
  </section>
</main>`;
};

const renderCoverLetterMain = (data: CoverLetterData): string => {
  const contact = data.contact
    .map((item) =>
      item.url
        ? `<a href="${safeUrl(item.url, ["http:", "https:", "mailto:"])}">${escapeHtml(item.text)}</a>`
        : escapeHtml(item.text),
    )
    .join("<br>\n        ");
  const paragraphs = data.paragraphs.map((paragraph) => `    <p>${escapeHtml(paragraph)}</p>`).join("\n");

  return `<main class="letter">
  <article class="sheet">
    <header class="head">
      <div>
        <h1 class="head__name">${escapeHtml(data.name)}</h1>
        <p class="head__label">${escapeHtml(data.label)}</p>
      </div>
      <p class="head__contact">
        ${contact}
      </p>
    </header>
    <div class="keyline"></div>
    <p class="greeting">${escapeHtml(data.greeting)}</p>
${paragraphs}
    <div class="closing">
      <div>${escapeHtml(data.closing)}</div>
      <div class="signature">${escapeHtml(data.name)}</div>
    </div>
  </article>
</main>`;
};

const renderHtmlDocument = (title: string, styles: string, main: string): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
${styles.trim()}
</style>
</head>
<body>
${main}
</body>
</html>
`;

export async function renderDocuments(options: RenderOptions = {}): Promise<void> {
  const resumeDataPath = options.resumeData ?? process.env.RESUME_DATA;
  const coverLetterDataPath = options.coverLetterData ?? process.env.COVER_LETTER_DATA;
  const baseStylesPath = options.baseStyles ?? "src/styles/base.css";
  const resumeStylesPath = options.resumeStyles ?? "src/styles/resume.css";
  const coverLetterStylesPath = options.coverLetterStyles ?? "src/styles/cover-letter.css";
  const outputDir = options.outputDir ?? process.env.DOCUMENT_OUTPUT_DIR ?? "tmp";
  const [resumeData, coverLetterData, baseStyles, resumeStyles, coverLetterStyles] = await Promise.all([
    resumeDataPath ? readJson<ResumeData>(resumeDataPath) : Promise.resolve(defaultResume),
    coverLetterDataPath ? readJson<CoverLetterData>(coverLetterDataPath) : Promise.resolve(defaultCoverLetter),
    readFile(baseStylesPath, "utf8"),
    readFile(resumeStylesPath, "utf8"),
    readFile(coverLetterStylesPath, "utf8"),
  ]);

  const [resumeMain, coverLetterMain] = await Promise.all([
    renderResumeMain(resumeData),
    Promise.resolve(renderCoverLetterMain(coverLetterData)),
  ]);
  const resumeHtml = renderHtmlDocument(
    `${resumeData.basics.name}, ${resumeData.basics.label}`,
    `${baseStyles}\n${resumeStyles}`,
    resumeMain,
  );
  const coverLetterHtml = renderHtmlDocument(
    coverLetterData.title,
    `${baseStyles}\n${coverLetterStyles}`,
    coverLetterMain,
  );

  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDir, "resume.html"), resumeHtml),
    writeFile(path.join(outputDir, "cover-letter.html"), coverLetterHtml),
    writeFile(path.join(outputDir, "resume.json"), `${JSON.stringify(resumeData, null, 2)}\n`),
    writeFile(path.join(outputDir, "cover-letter.json"), `${JSON.stringify(coverLetterData, null, 2)}\n`),
  ]);

  console.log(`Rendered resume and cover letter to ${outputDir}/`);
}

if (import.meta.main) {
  await renderDocuments();
}
