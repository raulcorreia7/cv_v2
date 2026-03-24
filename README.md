# cv_2.0

Static resume site with:

- the original `jsonresume-theme-macchiato` HTML theme
- a print-stable PDF generated from the same HTML with Playwright/Chromium
- one Bun-based task surface shared by local work, CI, and deployment

## Stack

- `resumed` renders `src/template/resume.json` into `output/resume.html`
- `scripts/postprocess-resume.ts` applies minimal HTML and print fixes
- `scripts/export-pdf.ts` exports the same HTML to PDF with Playwright
- `src/assets/` provides static files copied into the generated output

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
  assets/                  Static files copied into output during builds
  template/resume.json     Primary resume source
  template/cover-letter.json
scripts/
  run.ts                   Shared task entrypoint
  build.ts                 HTML build orchestration
  postprocess-resume.ts    Minimal HTML and print fixes
  export-pdf.ts            Playwright PDF export
output/                    Generated site artifacts
.github/workflows/deploy.yml
```

## Commands

- `make build` builds the HTML output
- `make resume` builds only `output/resume.html`
- `make cover-letter` builds only `output/cover-letter.html`
- `make pdf` builds and exports `output/resume.pdf`
- `make cover-letter-pdf` builds and exports `output/cover-letter.pdf`
- `make all` runs the full flow
- `make ci` runs the local smoke-check used by CI
- `make serve` serves the generated output locally
- `make stop` stops the local Bun server
- `make dev` rebuilds on template, asset, or script changes
- `make clean` removes generated artifacts

There is no dedicated automated test suite in this repo yet. `make ci` is the relevant smoke check.

## Build Flow

```text
src/template/resume.json
        |
        v
output/resume.json
        |
        v
resumed
        |
        v
output/resume.html
        |
        +--> postprocess-resume.ts
        |         |
        |         v
        |   polished HTML
        |
        +--> export-pdf.ts
                  |
                  v
            output/resume.pdf
```

## Layout Markers

The resume uses one canonical source file: [src/template/resume.json](./src/template/resume.json).

Page layout is controlled with a namespaced extension under `meta.x-layout.pages`. This keeps the data in the same JSON file without introducing a second schema or conversion step.

Current intent:

- page 1 contains the header, left-side profile/skills, summary, and all experience
- page 2 contains projects, education, and awards

Example shape:

```json
"meta": {
  "x-layout": {
    "pages": [
      {
        "id": "experience",
        "header": true,
        "left": [],
        "right": ["about", "summary", "work"]
      },
      {
        "id": "extra",
        "header": false,
        "left": ["skills", "languages", "interests"],
        "right": ["projects", "education", "awards"]
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

The pipeline in [deploy.yml](./.github/workflows/deploy.yml) builds the site on every pull request and deploys on pushes to `main` or `master` using Cloudflare Pages Direct Upload.

### One-time Cloudflare setup

1. Create a Cloudflare Pages project for this repo.
2. Add these GitHub repository secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. Add this GitHub repository variable:
   - `CLOUDFLARE_PAGES_PROJECT`
4. In Cloudflare Pages, attach the custom domain `cv.raulcorreia.dev`.

After that, every push to the production branch will publish:

- `/` via `output/index.html`, generated from `resume.html`
- `/resume.html`
- `/resume.pdf`
- `/cover-letter.html`
- `/cover-letter.pdf`

## Notes

- `output/` is generated and should not be edited by hand.
- Theme changes are handled in `scripts/postprocess-resume.ts` to keep the upstream theme dependency untouched.
- Static hosting headers live in `src/assets/_headers`.
- `output/index.html` is generated from `output/resume.html` during the resume build.
- The resume uses explicit page grouping and currently validates as a 2-page PDF with Chromium export.
- Docker remains available for a containerized build through the provided `Dockerfile`.
