# AGENTS.md — Repository Guide for Coding Agents

Purpose
- Help agentic tools work safely in this repo.
- Keep changes minimal, consistent, and reproducible.
- Prefer boring, explicit workflows over clever automation.

Repository snapshot (observed)
- Primary artifacts: `src/resume.html` (CV, published) and `src/cover-letter.html` (private).
- Each document is self-contained: content, CSS tokens, and the profile photo embedded as a data URI.
- No framework, no template, no build step, no webfonts.
- `tmp/` holds scratch exports; `output/` holds the publishable site.
- Build tooling: `justfile`, Docker, Bun, Playwright.
- `DESIGN.md` specifies the design.

Key paths
- `src/resume.html` — the CV.
- `src/cover-letter.html` — the cover letter.
- `src/assets/` — source images; the documents embed a copy.
- `scripts/export-pdf.ts` — HTML to PDF via Playwright.
- `scripts/build-site.ts` — PDF export plus site assembly.
- `scripts/serve.ts` — static preview server.
- `DESIGN.md` — tokens, type scale, spacing, components, print rules.
- `./tmp/`, `./output/` — generated; never edit by hand.

Commands (from justfile; all run in the container)
- Build the image: `just build-image` (`just install`)
- CV PDF: `just pdf` to `tmp/resume.pdf`
- Cover letter PDF: `just cover-letter-pdf` to `tmp/cover-letter.pdf`
- Any HTML or URL to PDF: `just pdf-file <input> <output>`
- Publishable site: `just site` to `output/` (`just ci`)
- Preview: `just serve` on `http://localhost:8080`
- Stop preview: `just stop`; clean artifacts: `just clean`; shell: `just shell`

Verification
- There is no test runner. `just pdf` is the smoke check after content or style changes; `just site` after layout changes.
- Check the PDF stays 2 pages: `pdfinfo tmp/resume.pdf`.
- Confirm nothing was pushed off a sheet: `pdftotext tmp/resume.pdf - | grep "<text>"`.

Configuration and environment
- `PORT` overrides the preview port; `PDF_INPUT` and `PDF_OUTPUT` override the export paths (a URL is accepted).
- `just` loads an optional gitignored `.env` via `dotenv-load`. No other configuration exists.

Document conventions
- HTML uses two-space indentation, sentence case, double quotes on attributes, and semantic elements (`article` for entries, `section` for blocks).
- Prose uses plain words, active voice, no em dashes, and no filler. Keep names, dates, and technologies exact.
- Position lines keep the `Title - City, Country` delimiter; that hyphen is data, not punctuation.

Editing rules
- Edit the documents directly; they are the only source of truth. Content lives nowhere else.
- Keep each sheet at or under 1122.5px tall. A taller sheet silently becomes an extra PDF page instead of clipping.
- Sheet 1 = `sheet--main` (summary and recent roles); sheet 2 = `sheet--more` (earlier roles, projects, education, awards). Move an entry between them to rebalance.
- Update `src/resume.html` and `src/cover-letter.html` together when a token or spacing value changes, and mirror it in `DESIGN.md`.

Data and content rules
- Dates in entries are `MM/YYYY` ranges rendered by hand; keep the existing format.
- Keep the tech line format `<tech> · <tech> · ...` on one trailing line per entry.
- Replacing the photo means rebuilding its data URI from `src/assets/`.

Security and secrets
- Do not commit secrets or private data. `src/cover-letter.html` and `src/template/motivation-letter-*.txt` are private documents and are not published.

Change discipline
- Keep diffs small and scoped to the requested change.
- Avoid opportunistic refactors unless they remove risk or duplication.
- If a change is speculative, label it `Unverified` and explain why.

Quick examples
- Rebuild the CV PDF after editing: `just pdf`
- Rebuild the site after a layout change: `just site`
- Preview documents while editing: `just serve`, then open `/src/resume.html`
- Export an older revision of a document: `just pdf-file /tmp/old.html /tmp/old.pdf`

End of file
