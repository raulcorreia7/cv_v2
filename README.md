# cv_2.0

Static resume site with:

- HTML resume output
- PDF export from the same HTML via Playwright/Chromium
- GitHub Actions for CI and manual GitHub Pages release

## Stack

- `resumed` renders `src/template/resume.json` into `./tmp/resume.html`
- `scripts/postprocess-resume.ts` applies minimal HTML and print fixes
- `scripts/export-pdf.ts` exports the same HTML to PDF with Playwright
- `src/assets/` provides static files copied into the generated output
- `Dockerfile` exposes `base`, `build`, `release`, `dev`, and `runtime` stages; `just` runs every task in the `base` image so the host needs no toolchain
- `tmp/` is the working build directory
- `output/` is the publishable bundle

## Quick Start

```bash
just build
just pdf
just dev
```

Local requirements:

- `just` + Docker (everything else — Bun, Chromium — lives in the image)

## Repository Layout

```text
src/
  assets/                  Static files copied into tmp during builds
  template/resume.json     Primary resume source
  template/cover-letter.json
scripts/
  run.ts                   Shared task entrypoint
  build.ts                 HTML build orchestration
  postprocess-resume.ts    Minimal HTML and print fixes
  export-pdf.ts            Playwright PDF export
./tmp/                     Generated site artifacts
output/                    Publishable bundle
DESIGN.md                  Reverse-engineered design spec of the rendered resume
.github/workflows/ci.yml
.github/workflows/release.yml
```

## Commands

- `just build` builds the resume HTML
- `just resume` builds only `./tmp/resume.html`
- `just cover-letter` builds only `./tmp/cover-letter.html` as a manual step
- `just pdf` builds and exports `./tmp/resume.pdf`
- `just cover-letter-pdf` builds and exports `./tmp/cover-letter.pdf` as a manual step
- `just all` builds the primary resume bundle
- `just ci` runs the local smoke-check used by CI
- `just release` builds the release bundle into `output/`
- `just serve` serves the generated output locally
- `just stop` stops the serve/dev container
- `just dev` rebuilds on template, asset, or script changes
- `just clean` removes generated artifacts
- `RESUME_COLOR_VARIANT=<name> just build` selects a palette variant for the resume output

Available `RESUME_COLOR_VARIANT` values:
- `slate-green` (default)
- `original`
- `slate-blue`
- `deep-ink`
- `aubergine-grey`
- `bronze-taupe`
- `graphite-navy`
- `oxford-burgundy`
- `steel-teal`
- `charcoal-blue`

There is no dedicated automated test suite in this repo yet. `just ci` is the relevant smoke check.

## Recommended Flow

- Use `just build`, `just pdf`, and `just dev` while iterating locally.
- Use `just all` or `just ci` when you want the full primary bundle.
- Use `just release` when you want the publishable bundle in `output/`.
- Treat cover-letter generation as manual: use `just cover-letter` or `just cover-letter-pdf` only when you explicitly want those artifacts.
- GitHub Actions runs a build-only CI workflow and a separate manual GitHub Pages release workflow.
- If you want a custom destination, override it explicitly, for example `just release` with `OUTPUT_DIR=dist` in `.env`.
- If you want a different color language, set `RESUME_COLOR_VARIANT`, for example `RESUME_COLOR_VARIANT=graphite-navy just build`.

## Build Flow

```text
src/template/resume.json
        |
        v
./tmp/resume.json
        |
        v
resumed
        |
        v
./tmp/resume.html
        |
        +--> postprocess-resume.ts
        |         |
        |         v
        |   polished HTML
        |
        +--> export-pdf.ts
                  |
                  v
            ./tmp/resume.pdf
```

## Layout Markers

The resume uses one canonical source file: [src/template/resume.json](./src/template/resume.json).

Page layout is controlled with a namespaced extension under `meta.x-layout.pages`. This keeps the data in the same JSON file without introducing a second schema or conversion step.

Current intent:

- page 1 contains the header, left-side profile/skills, summary, and recent experience
- page 2 contains earlier experience, projects, education, and awards

Example shape:

```json
"meta": {
  "x-layout": {
    "pages": [
      {
        "id": "experience",
        "header": true,
        "left": [],
        "right": ["about", "summary", "work:core"]
      },
      {
        "id": "extra",
        "header": false,
        "left": ["skills", "languages", "interests"],
        "right": ["work:secondary", "projects", "education", "awards"]
      }
    ]
  }
}
```

Supported section names:

- `about`
- `summary`
- `work`
- `skills`
- `languages`
- `interests`
- `projects`
- `education`
- `awards`
- `volunteer`
- `references`

## Deployment

### One-time setup

1. CI builds the site and uploads `output/` as an artifact.
2. The `Release to GitHub Pages` workflow deploys `output/` manually.
3. In GitHub Pages settings, set the source to `GitHub Actions`.
4. In GitHub Pages settings, set the custom domain to `cv.raulcorreia.dev`.
5. In Cloudflare DNS, create a `CNAME` for `cv` pointing to `raulcorreia7.github.io`.

The primary published bundle currently contains:

- `/` via `output/index.html`, generated from `resume.html`
- `/resume.html`
- `/resume.pdf`

## Notes

- `./tmp/` is generated and should not be edited by hand.
- `output/` is generated and should not be edited by hand.
- Theme changes are handled in `scripts/postprocess-resume.ts` to keep the upstream theme dependency untouched.
- `./tmp/index.html` is generated from `./tmp/resume.html` during the resume build.
- The resume uses explicit page grouping and currently validates as a 2-page PDF with Chromium export.
