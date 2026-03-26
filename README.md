# cv_2.0

Static resume site with:

- the original `jsonresume-theme-macchiato` HTML theme
- a print-stable PDF generated from the same HTML with Playwright/Chromium
- one Bun-based task surface shared by local work, CI, and deployment

## Stack

- `resumed` renders `src/template/resume.json` into `./tmp/resume.html`
- `scripts/postprocess-resume.ts` applies minimal HTML and print fixes
- `scripts/export-pdf.ts` exports the same HTML to PDF with Playwright
- `src/assets/` provides static files copied into the generated output
- `tmp/` is the default local build directory, while `output/` is reserved for release bundles

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
output/                    Release artifacts created by make release
.github/workflows/deploy.yml
```

## Commands

- `make build` builds the HTML output
- `make resume` builds only `./tmp/resume.html`
- `make cover-letter` builds only `./tmp/cover-letter.html`
- `make pdf` builds and exports `./tmp/resume.pdf`
- `make cover-letter-pdf` builds and exports `./tmp/cover-letter.pdf`
- `make all` runs the full local flow in the default output directory
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

- Use `make build`, `make pdf`, and `make dev` while iterating locally. These write to `tmp/` by default.
- Use `make ci` when you want the full local smoke-check in the current output directory.
- Use `make release` when you want a publishable bundle in `output/`.
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

- `./tmp/` is generated and should not be edited by hand.
- `output/` is generated by `make release` and should not be edited by hand.
- Theme changes are handled in `scripts/postprocess-resume.ts` to keep the upstream theme dependency untouched.
- Static hosting headers live in `src/assets/_headers`.
- `./tmp/index.html` is generated from `./tmp/resume.html` during the resume build.
- The resume uses explicit page grouping and currently validates as a 2-page PDF with Chromium export.
- Docker remains available for a containerized build through the provided `Dockerfile`.
