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
- `Dockerfile` exposes `build`, `release`, `dev`, and `runtime` stages aligned with the local Make targets
- `tmp/` is the working build directory
- `output/` is the publishable bundle

## Quick Start

```bash
make install
make build
make pdf
make dev
```

Local requirements:

- Bun `1.3.11`

`make install` also installs the Chromium browser Playwright uses for PDF export.

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
.github/workflows/ci.yml
.github/workflows/release.yml
```

## Commands

- `make build` builds the resume HTML
- `make resume` builds only `./tmp/resume.html`
- `make cover-letter` builds only `./tmp/cover-letter.html` as a manual step
- `make pdf` builds and exports `./tmp/resume.pdf`
- `make cover-letter-pdf` builds and exports `./tmp/cover-letter.pdf` as a manual step
- `make all` builds the primary resume bundle
- `make ci` runs the local smoke-check used by CI
- `make release` builds the release bundle into `output/`
- `make serve` serves the generated output locally
- `make stop` stops the local Bun server
- `make dev` rebuilds on template, asset, or script changes
- `make clean` removes generated artifacts
- `RESUME_COLOR_VARIANT=<name> make build` selects a palette variant for the resume output

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

There is no dedicated automated test suite in this repo yet. `make ci` is the relevant smoke check.

## Recommended Flow

- Use `make build`, `make pdf`, and `make dev` while iterating locally.
- Use `make all` or `make ci` when you want the full primary bundle.
- Use `make release` when you want the publishable bundle in `output/`.
- Treat cover-letter generation as manual: use `make cover-letter` or `make cover-letter-pdf` only when you explicitly want those artifacts.
- GitHub Actions runs a build-only CI workflow and a separate manual GitHub Pages release workflow.
- If you want a custom destination, override it explicitly, for example `make OUTPUT_DIR=dist ci`.
- If you want a different color language, set `RESUME_COLOR_VARIANT`, for example `make RESUME_COLOR_VARIANT=graphite-navy build`.

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
