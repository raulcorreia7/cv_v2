# AGENTS.md — Repository Guide for Coding Agents

Purpose
- Help agentic tools work safely in this repo.
- Keep changes minimal, consistent, and reproducible.
- Prefer boring, explicit workflows over clever automation.

Repository snapshot (observed)
- Primary artifact: `src/template/resume.json` (FRESH format data).
- Generated outputs live in `output/` (HTML/PDF/JSON).
- Build tooling: `Makefile`, `pnpm`, `hackmyresume`, `resumed`.
- Theme patches live in `patches/` and apply to `node_modules`.
- Runtime: Node.js v24.12.0 (`.nvmrc`).

Cursor/Copilot rules
- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` found.

Key paths
- `src/template/resume.json` — primary content source.
- `src/assets/` — images and static assets used by the theme.
- `scripts/export-pdf.sh` — wkhtmltopdf wrapper.
- `patches/` — pnpm patches for theme/tooling.
- `output/` — generated artifacts (do not edit by hand).

Commands (from README + Makefile)
- Install dependencies: `make install`
- Build HTML resume: `make build`
- Export PDF (requires wkhtmltopdf): `make export-pdf`
- Build HTML + PDF: `make all`
- Start local server: `make serve`
- Watch for changes: `make watch`
- Clean generated files: `make clean`
- Docker build: `make docker-build`
- Docker run: `make docker-run`
- Docker build + run: `make docker-all`
- List targets: `make help`

Single-task “test” guidance
- There is no automated test runner configured.
- Treat `make build` as a smoke check after data or theme changes.
- If PDFs are affected, run `make export-pdf`.
- If you add tests in the future, document the single-test command here.

Linting/formatting
- No lint or formatter scripts are configured in `package.json`.
- Formatting conventions are inferred from existing files (see below).

Configuration and environment
- Default paths are defined in `Makefile` and can be overridden via env vars:
  - `RESUME_FILE`, `ASSETS_DIR`, `OUTPUT_DIR`, `TEMPLATE_DIR`, `THEME`.
- Example override: `OUTPUT_DIR=dist make build`.

Code style — observed conventions
- JSON uses 2-space indentation and double quotes.
- Lists are ordered by relevance and grouped logically by section.
- Dates are `YYYY-MM` (partial ISO 8601) in `employment` and `projects`.
- Content strings are sentence case with minimal punctuation.

Code style — general guidance (Unverified)
- Preserve key order in `src/template/resume.json` to minimize diff noise.
- Keep bullet lists concise and parallel in tone and tense.
- Avoid adding new fields unless the theme or schema requires them.
- Keep asset filenames lowercase and use hyphens for words.

JavaScript/Node guidance (project-wide)
- The repo is ESM (`"type": "module"` in `package.json`).
- Use `import`/`export` syntax if adding JS files.
- Keep Node compatibility aligned to `.nvmrc` (v24.12.0).

Shell scripts
- Use POSIX sh (`#!/bin/sh`) and keep `set -eu` at top.
- Quote variables and check required commands/files explicitly.
- Fail fast with clear error messages.

Makefile conventions
- Targets are small and explicit; prefer wiring via env vars.
- Avoid adding complex shell logic inside targets.
- Keep targets idempotent and safe to rerun.

Theme and patch workflow
- Do not edit `node_modules` directly without creating a patch.
- Use `pnpm patch-package <package>` to capture changes.
- Keep patch scope minimal and focused on specific UI tweaks.

Data and content rules
- `output/` is generated and should not be hand-edited or committed.
- Add new images to `src/assets/` and run `make build`.
- Keep skill, employment, and project entries consistent in structure.

Error handling and resilience
- Validate existence of expected files before running tools.
- Prefer explicit checks over implicit assumptions.
- Log actionable errors (file missing, command missing, invalid path).

Security and secrets
- `.env` is present; do not commit secrets or add sensitive data.
- Avoid embedding private info in `output/` artifacts.

Documentation hygiene
- Update `README.md` or this file when commands or workflows change.
- If new lint/test tools are added, record their commands here.

Change discipline
- Keep diffs small and scoped to the requested change.
- Avoid opportunistic refactors unless they remove risk or duplication.
- If a change is speculative, label it `Unverified` and explain why.

Quick examples
- Build with a different output directory:
  - `OUTPUT_DIR=dist make build`
- Rebuild after changing `resume.json`:
  - `make build`
- Generate a PDF after theme tweaks:
  - `make export-pdf`

End of file
