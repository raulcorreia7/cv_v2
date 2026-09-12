# cv.raulcorreia.dev

Typed source data rendered to self-contained HTML, JSON, and PDF:

- `src/data/` — the canonical CV and cover letter content
- `src/styles/` — shared and document-specific CSS
- `tmp/resume.html` and `tmp/cover-letter.html` — generated standalone documents
- `tmp/resume.pdf` — PDF export of the CV for sharing

The source modules are checked against owned TypeScript contracts. The renderer
also emits portable JSON, embeds the profile photo, and keeps the output usable
without external assets or webfonts.

## Requirements

`just` and Docker. Bun, Playwright, and Chromium live in the image.

## Commands

| Command | Result |
|---|---|
| `just typecheck` | strict TypeScript check of document data and build scripts |
| `just render` | `tmp/resume.{html,json}` and `tmp/cover-letter.{html,json}` |
| `just pdf` | `tmp/resume.pdf` (2 pages, A4); runs the copy check first |
| `just pdf-ats` | `tmp/resume-ats.pdf`, single column for portals that parse the CV |
| `just check` | type, copy, structure, and A4 sheet-height checks for both documents |
| `just coverage <posting>` | posting terms the CV does not carry yet, for tailoring |
| `just tailor <slug>` | working copy of both documents in `tmp/applications/<slug>/` |
| `just cover-letter-pdf` | `tmp/cover-letter.pdf` (1 page, A4) |
| `just pdf-file <input> <output>` | PDF from any HTML file or `http://` URL |
| `just site` | publishable site in `output/` (`just ci` is an alias) |
| `just serve` | preview on `http://localhost:8080` |
| `just stop` | stop the preview container |
| `just clean` | remove `tmp/` and `output/` |
| `just install` | build the image (`just build-image`) |
| `just shell` | shell inside the image |

`just serve` serves the repository root. Run `just render`, then open
`/tmp/resume.html` or `/tmp/cover-letter.html`; `/output/` shows the assembled
site.

## Editing

- Edit CV content in `src/data/profile.ts`, `work.ts`, and `projects.ts`. Edit
  the cover letter in `src/data/cover-letter.ts`. The `satisfies` declarations
  keep each module aligned with `src/data/types.ts`, and every standard build
  runs the strict compiler check.
- Sheet assignment is explicit. `page: "main"` places a role on page 1 and
  `page: "more"` places it on page 2. Projects, education, and awards stay on
  page 2.
- Keep each sheet under 1122.5px tall (A4 at 96dpi). A taller sheet silently
  becomes an extra PDF page instead of clipping.
- Replace the image named by `basics.photo`; the renderer rebuilds its data URI.
- `DESIGN.md` specifies the design: tokens, type scale, spacing, components, and
  print rules. Change shared values in `src/styles/base.css` and update the
  normative value in `DESIGN.md`.

## Site

`just site` renders the source and writes `output/`: `index.html`, `resume.html`,
and `resume.pdf`. The CV is copied to both HTML names so `/` serves it directly;
the cover letter is never published.

GitHub Actions runs `bun scripts/build-site.ts` on push and uploads `output/` as
an artifact. The manual `Release to GitHub Pages` workflow deploys the same
directory to Pages. For the custom domain, keep the Pages source set to GitHub
Actions, the custom domain set to `cv.raulcorreia.dev`, and the Cloudflare
`CNAME` for `cv` pointing at `raulcorreia7.github.io`.

## Layout

```text
src/
  assets/                  Source images (the renderer embeds a copy)
  data/                    Typed CV and cover letter content
  styles/                  Shared, CV, and cover letter CSS
  motivation-letter-*.txt  private letters, not published
scripts/
  render-documents.ts    Typed data to standalone HTML and JSON
  export-pdf.ts          HTML to PDF via Playwright
  build-site.ts          PDF export plus site assembly
  serve.ts               static preview server
  check-copy.ts          copy and structure gate, runs before every export
  check-layout.ts        rendered A4 sheet-height gate
  check-coverage.ts      posting terms the CV does not carry yet
docs/
  applying.md            per-application pass
  resume-writing-evidence.md  the research behind these rules
DESIGN.md                design specification
Dockerfile               base (bun + chromium), site, runtime stages
output/                  generated, not published from the repo
tmp/                     generated scratch
```

## Notes

- No webfonts and no external requests: both documents render offline.
- `tmp/` and `output/` are generated and should not be edited by hand.
