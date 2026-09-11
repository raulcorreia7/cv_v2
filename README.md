# cv.raulcorreia.dev

Two self-contained HTML documents and a PDF export:

- `src/resume.html` — the CV, published to `cv.raulcorreia.dev`
- `src/cover-letter.html` — the cover letter, kept out of the published site
- `tmp/resume.pdf` — PDF export of the CV for sharing

Each document holds its own content, CSS, and embedded photo. There is no
framework, no template, and no build step: edit the HTML, open it in a browser,
print it to PDF from the print dialog.

## Requirements

`just` and Docker. Bun, Playwright, and Chromium live in the image.

## Commands

| Command | Result |
|---|---|
| `just pdf` | `tmp/resume.pdf` (2 pages, A4); runs the copy check first |
| `just pdf-ats` | `tmp/resume-ats.pdf`, single column for portals that parse the CV |
| `just check` | copy check on both documents: doubled words, dashes, duty phrasing, date formats, tag balance |
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

`just serve` serves the repository root, so `src/resume.html` and
`src/cover-letter.html` are live while you edit them, and `/output/` shows the
assembled site.

## Editing

- Text, sections, and entries are plain markup in the document itself. Copy an
  existing `<article class="entry">` or `<section class="block">` to add one.
- Sheet assignment is explicit: page 1 holds the summary and the recent roles
  (`sheet--main`), page 2 holds the earlier roles, projects, education, and
  awards (`sheet--more`). Move an entry between the two containers to rebalance.
- Keep each sheet under 1122.5px tall (A4 at 96dpi). A taller sheet silently
  becomes an extra PDF page instead of clipping.
- The photo is a data URI inside `resume.html`. To replace it, overwrite
  `src/assets/` with the new image and rebuild the attribute:
  `printf 'data:image/jpeg;base64,%s' "$(base64 -w0 src/assets/raul-circle-ai.jpg)"`.
- `DESIGN.md` specifies the design: tokens, type scale, spacing, components, and
  print rules. Change a value in both documents and in `DESIGN.md` so the two
  stay equal.

## Site

`just site` writes `output/`: `index.html`, `resume.html`, and `resume.pdf`. The
CV is copied to both HTML names so `/` serves it directly; the cover letter is
never published.

GitHub Actions runs `bun scripts/build-site.ts` on push and uploads `output/` as
an artifact. The manual `Release to GitHub Pages` workflow deploys the same
directory to Pages. For the custom domain, keep the Pages source set to GitHub
Actions, the custom domain set to `cv.raulcorreia.dev`, and the Cloudflare
`CNAME` for `cv` pointing at `raulcorreia7.github.io`.

## Layout

```text
src/
  assets/          Source images (the documents embed a copy)
  cover-letter.html
  resume.html
scripts/
  export-pdf.ts    HTML to PDF via Playwright
  build-site.ts    PDF export plus site assembly
  serve.ts         static preview server
DESIGN.md          design specification
Dockerfile         base (bun + chromium), site, runtime stages
output/            generated, not published from the repo
tmp/               generated scratch
```

## Notes

- No webfonts and no external requests: both documents render offline.
- `tmp/` and `output/` are generated and should not be edited by hand.
