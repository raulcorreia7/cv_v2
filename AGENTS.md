# AGENTS.md — Repository Guide for Coding Agents

Purpose
- Help agentic tools work safely in this repo.
- Keep changes minimal, consistent, and reproducible.
- Prefer boring, explicit workflows over clever automation.

Repository snapshot (observed)
- Primary sources: strongly typed document data in `src/data/` and CSS in `src/styles/`.
- The renderer writes self-contained HTML and portable JSON to `tmp/`; Playwright exports PDF from that HTML.
- No UI framework or webfonts. Bun renders the templates with the typed data modules.
- `tmp/` holds scratch exports; `output/` holds the publishable site.
- Build tooling: `justfile`, Docker, Bun, Playwright.
- `DESIGN.md` specifies the design.

Key paths
- `src/data/resume.ts` — the assembled CV data.
- `src/data/work.ts`, `projects.ts`, `profile.ts` — focused CV content modules.
- `src/data/cover-letter.ts` — the cover letter data.
- `src/data/types.ts` — the document contracts.
- `src/styles/` — shared, CV, and cover letter CSS.
- `src/assets/` — source images; the renderer embeds a copy.
- `scripts/render-documents.ts` — typed data to self-contained HTML and JSON.
- `scripts/export-pdf.ts` — HTML to PDF via Playwright.
- `scripts/build-site.ts` — PDF export plus site assembly.
- `scripts/serve.ts` — static preview server.
- `DESIGN.md` — tokens, type scale, spacing, components, print rules.
- `./tmp/`, `./output/` — generated; never edit by hand.

Commands (from justfile; all run in the container)
- Build the image: `just build-image` (`just install`)
- Render HTML and JSON: `just render` to `tmp/`
- Type check document contracts and build scripts: `just typecheck`
- CV PDF: `just pdf` to `tmp/resume.pdf`; it runs the copy check first
- Single-column CV PDF for portals that parse: `just pdf-ats` to `tmp/resume-ats.pdf`
- Copy check alone: `just check`
- Posting terms the CV lacks: `just coverage <file-or-url>`
- Per-application working copy: `just tailor <slug>` into `tmp/applications/<slug>/`
- Cover letter PDF: `just cover-letter-pdf` to `tmp/cover-letter.pdf`
- Any HTML or URL to PDF: `just pdf-file <input> <output>`
- Publishable site: `just site` to `output/` (`just ci`)
- Preview: `just serve` on `http://localhost:8080`
- Stop preview: `just stop`; clean artifacts: `just clean`; shell: `just shell`

Verification
- There is no test runner. `just typecheck` checks document contracts and build scripts. `just pdf` is the smoke check after content or style changes; `just site` after layout changes.
- `just check` gates every export: TypeScript contracts, doubled words, dash style, duty phrasing, date and duration formats, unescaped ampersands, unbalanced tags, and A4 sheet height.
- Check the PDF stays 2 pages: `pdfinfo tmp/resume.pdf`. Both export variants must stay at 2.
- Confirm nothing was pushed off a sheet: `pdftotext tmp/resume.pdf - | grep "<text>"`.
- Confirm the ATS export reads in order: `pdftotext tmp/resume-ats.pdf - | head -20`.

Configuration and environment
- `PORT` overrides the preview port; `PDF_INPUT`, `PDF_OUTPUT` and `PDF_ATS=1` control the export (a URL is accepted as input).
- `RESUME_DATA`, `COVER_LETTER_DATA`, and `DOCUMENT_OUTPUT_DIR` override the renderer inputs and destination for tailored copies.
- `just` loads an optional gitignored `.env` via `dotenv-load`. No other configuration exists.

Document conventions
- TypeScript uses two-space indentation and the repository formatter style. Data modules use `satisfies` against the contracts in `src/data/types.ts`.
- Rendered HTML uses sentence case, double quotes on attributes, and semantic elements (`article` for entries, `section` for blocks).
- Prose uses plain words, active voice, no em dashes, and no filler. Keep names, dates, and technologies exact.
- Position lines keep the `Title - City, Country` delimiter; that hyphen is data, not punctuation.

Editing rules
- Edit content in `src/data/`. Do not edit generated files in `tmp/` or `output/`.
- Edit document markup in the renderer and CSS in `src/styles/`.
- Keep each sheet at or under 1122.5px tall. A taller sheet silently becomes an extra PDF page instead of clipping.
- `page: "main"` places a role on sheet 1; `page: "more"` places it on sheet 2. Keep four roles on each unless the rendered fit proves another split works.
- Put shared tokens in `base.css`; mirror normative token or spacing changes in `DESIGN.md`.

Data and content rules
- Dates in entries are `MM/YYYY` ranges rendered by hand; keep the existing format.
- Each work entry carries a duration under its dates, counted inclusively (`6 mos`, `1 yr 7 mos`), and to the present as of the last edit for a role that is still open.
- Consecutive roles at one employer state the combined tenure once, on the most recent entry, labelled `at <employer>`; the earlier entry carries no duration line so the same months are not counted twice.
- Keep technologies as arrays. The renderer joins them with ` · ` on one trailing line per entry.
- Replace the source image named by `basics.photo`; the renderer rebuilds its data URI.

Security and secrets
- This repository is public. `src/data/cover-letter.ts` and the `src/motivation-letter-*.txt` files are personal documents that the site does not deploy, but they are readable in the repository.
- Do not add credentials, tokens, or anything you would not put on the live site.

Change discipline
- Keep diffs small and scoped to the requested change.
- Avoid opportunistic refactors unless they remove risk or duplication.
- If a change is speculative, label it `Unverified` and explain why.

Quick examples
- Rebuild the CV PDF after editing: `just pdf`
- Rebuild the site after a layout change: `just site`
- Preview documents while editing: `just render`, `just serve`, then open `/tmp/resume.html`
- Export an older revision of a document: `just pdf-file /tmp/old.html /tmp/old.pdf`

End of file
