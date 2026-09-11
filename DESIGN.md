---
version: alpha
name: CV Resume Print Stack
description: Reverse-engineered design spec of the A4 resume produced by src/template/resume.json through resumed + jsonresume-theme-macchiato + scripts/postprocess-resume.ts. Written so the same output can be rebuilt on another renderer without re-deriving these values.
colors:
  surface: "#ffffff"
  ink: "#23343c"
  ink-strong: "#1f3139"
  heading: "#24353d"
  body-alt: "#31454d"
  chip-ink: "#2f4443"
  muted: "#5c6d75"
  accent: "#4c6b68"
  accent-soft: "#eef4f3"
  border-soft: "#d9e4e2"
  accent-original: "#56817a"
  accent-slate-blue: "#3f5f7a"
  accent-deep-ink: "#2f4858"
  accent-aubergine-grey: "#5b4b5f"
  accent-bronze-taupe: "#7a5d45"
  accent-graphite-navy: "#38485f"
  accent-oxford-burgundy: "#6a4752"
  accent-steel-teal: "#41666a"
  accent-charcoal-blue: "#405166"
typography:
  name:
    fontFamily: "Iowan Old Style, Palatino Linotype, Book Antiqua, Noto Serif, Liberation Serif, Georgia, serif"
    fontSize: 35px
    fontWeight: 700
    lineHeight: 0.96
    letterSpacing: 0.2px
  role-label:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 15.4px
    fontWeight: 500
    lineHeight: 1.1
  section-title:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 12.2px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: 0.45px
  section-title-secondary:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 12.3px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: 0.5px
  left-section-title:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 10.6px
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: 0.38px
  entry-company:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 12.4px
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: 0.4px
  entry-role:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 10.9px
    fontWeight: 600
    lineHeight: 1.16
  entry-dates:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 9.3px
    fontWeight: 500
    lineHeight: 1.08
  body:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 10.7px
    fontWeight: 400
    lineHeight: 1.28
  entry-summary:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 10.3px
    fontWeight: 400
    lineHeight: 1.28
  tech-line:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 8.6px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0.1px
  left-body:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 8.7px
    fontWeight: 400
    lineHeight: 1.24
  skill-chip:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 7.8px
    fontWeight: 500
    lineHeight: 1.2
  project-title:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 10px
    fontWeight: 500
    lineHeight: 1.26
  education-program:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 9.9px
    fontWeight: 500
    lineHeight: 1.2
spacing:
  a4-sheet-height: 1122.5px
  page-width: 786px
  page-content-width: 763.45px
  page-padding-top: 8px
  page-padding-inline: 11.34px
  page-padding-bottom: 6px
  page-rule: 10px
  page-gap: 24px
  left-column-width: 164px
  left-column-gap: 12px
  section-gap: 16px
  grid-column-gap: 28px
  grid-row-gap: 14px
  container-gap: 8px
  item-gap: 5px
  entry-gap: 11px
  entry-separator-gap: 8px
  entry-line-gap: 3px
  keyline-width: 42px
  keyline-margin: 5px
  left-keyline-width: 32px
rounded:
  none: 0px
  full: 9999px
components:
  sheet:
    width: "{spacing.page-width}"
    backgroundColor: "{colors.surface}"
    padding: "{spacing.page-padding-top} {spacing.page-padding-inline} {spacing.page-padding-bottom}"
  sheet-top-rule:
    height: "{spacing.page-rule}"
    backgroundColor: "{colors.accent}"
  page-stack:
    gap: "{spacing.page-gap}"
  left-column:
    width: "{spacing.left-column-width}"
    paddingRight: "{spacing.left-column-gap}"
  section-title:
    textColor: "{colors.accent}"
    typography: "{typography.section-title}"
  keyline:
    width: "{spacing.keyline-width}"
    backgroundColor: "{colors.accent}"
  entry-company:
    textColor: "{colors.heading}"
    typography: "{typography.entry-company}"
  entry-role:
    textColor: "{colors.muted}"
    typography: "{typography.entry-role}"
  entry-dates:
    textColor: "{colors.muted}"
    typography: "{typography.entry-dates}"
  entry-separator:
    backgroundColor: "{colors.border-soft}"
  skill-chip:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.chip-ink}"
    typography: "{typography.skill-chip}"
    rounded: "{rounded.full}"
  skill-text:
    textColor: "{colors.body-alt}"
    typography: "{typography.left-body}"
  tech-line:
    textColor: "{colors.muted}"
    typography: "{typography.tech-line}"
---

# CV Resume Print Stack

## Overview

A single-person CV rendered as two A4 sheets from one JSON source. The voice is
institutional and quiet: a serif nameplate for personality, everything else in a
compact system-sans scaled so a full career history fits A4 while still staying
legible at print size. Hierarchy comes from weight, letter-spacing, and one
accent colour — never from boxes, shadows, or fills. Screen rendering is a
preview; the PDF is the artefact, and every layout decision is bound to A4
geometry rather than to a viewport.

Reference output: `tmp/resume.html` (screen) and `tmp/resume.pdf` (2 sheets).
Current fit: sheet 1 = 1002px and sheet 2 = 976px against a 1122.5px sheet, so
both carry about 120px of headroom. Re-measure after adding content; a taller
sheet becomes an extra PDF page rather than clipping.

## Colors

Neutral-dominant with a single desaturated accent. The accent is a build-time
variant (`RESUME_COLOR_VARIANT`, default `slate-green`); each variant supplies an
accent plus a matching soft tint and hairline, so the palette is always a
three-value set.

- **Ink (#23343c):** body and list text; the default foreground.
- **Ink Strong (#1f3139):** the serif nameplate only.
- **Heading (#24353d):** employer and organisation names.
- **Body Alt (#31454d):** entry summaries, contact rows, left-column values.
- **Chip Ink (#2f4443):** skill-chip label and left-column language/interests labels.
- **Muted (#5c6d75):** role label, dates, and the technology line.
- **Accent (#4c6b68, `slate-green`):** sheet top rule, section titles, keylines, icons.
- **Accent Soft (#eef4f3) / Border Soft (#d9e4e2):** chip fill and every hairline
  (entry separators, chip border, skill-column divider).

Variant triplets (`accent` / `accent-soft` / `border-soft`):

| Variant | Accent | Soft | Border |
|---|---|---|---|
| `original` | #56817a | #edf4f3 | #d8e6e3 |
| `slate-blue` | #3f5f7a | #edf3f7 | #d7e2ea |
| `slate-green` (default) | #4c6b68 | #eef4f3 | #d9e4e2 |
| `deep-ink` | #2f4858 | #edf2f4 | #d8e0e4 |
| `aubergine-grey` | #5b4b5f | #f3eef4 | #e2d9e4 |
| `bronze-taupe` | #7a5d45 | #f6f1ec | #e8ddd2 |
| `graphite-navy` | #38485f | #eef1f6 | #d9dfe8 |
| `oxford-burgundy` | #6a4752 | #f4eef0 | #e6d9dd |
| `steel-teal` | #41666a | #edf4f4 | #d8e5e5 |
| `charcoal-blue` | #405166 | #eef2f6 | #dae1e9 |

Unknown variant names fall back to `original`.

## Typography

Two families, both system stacks; no webfonts and no remote `@font-face` (the
pipeline strips them, so a rebuild must not depend on network fonts).

- **Display:** Iowan Old Style / Palatino / Book Antiqua / Noto Serif /
  Liberation Serif / Georgia. The name only, 35px, weight 700, line-height 0.96 —
  tight enough that ascenders nearly touch the label beneath.
- **UI:** Aptos / Segoe UI / Noto Sans / Liberation Sans / Arial. Everything else,
  from the 15.4px role label down to the 7.8px chip.
- **Section titles** are uppercase, 700, and letter-spaced (0.45px), coloured with
  the accent. This letter-spacing is what makes a 12.2px title read as a heading,
  so a reimplementation must keep it.
- **Body copy runs at 10.7px / 1.28**, entry summaries at 10.3px, the technology
  line at 8.6px, left-column values at 8.7px. Everything below 10px is small by
  screen standards and exists only to buy the sheet capacity; it reads correctly
  in print and at zoom. Nothing in the document is smaller than 7.8px, and the
  information-carrying small text (dates, technology lines, left column) sits at
  8.6px or above.

Sheet 2 runs slightly larger titles (12.3px, 0.5px tracking) because it carries
fewer, denser blocks.

## Layout

Fixed A4 geometry, not a responsive grid.

- **Sheet:** 786px border-box (208mm) — 202mm of content plus 3mm of inline
  padding each side — with a 10px accent rule along the top edge and 8px top /
  6px bottom padding. Screens stack sheets with a 24px gap; print repaginates
  them.
- **Print margin:** `@page { size: A4; margin: 3mm 0 }` — the inline mm is supplied
  by the printer margin, not by page padding, which is why padding declares the
  same 11.34px explicitly.
- **Two columns on sheet 1:** a 164px rail (profile, skills, languages, interests)
  and a fluid main column (summary, experience) with a 12px gutter. The rail is
  roughly a fifth of the sheet, which holds the main column's measure near 90
  characters. The main column comes first in the DOM and CSS grid places the rail
  to its left, so the source reads in order for anything that reads the HTML.
  A column layout is the one formatting choice ATS vendors warn about, so PDF
  export has a single-column mode (`just pdf-ats`) for portals; it lays the rail
  blocks side by side and drops the sheet break, and both variants stay two pages.
- **Sheet 2 is two columns too, as blocks:** earlier experience and projects each
  render as a two-column grid (28px column gap, 14px row gap, section title
  spanning both). Education and awards stay full width. This keeps sheet 2's
  measure at roughly 55 characters instead of stretching a single column across
  the sheet.
- **Hero:** name and role label on the left of the header, a 44px circular photo
  with a 2px accent border on the right.
- **Sections** are separated by 8px of top padding plus a title with a 5px keyline
  under it (42px wide, 1px accent hairline; 32px in the left column).
- **Entries** stack with an 11px margin and a 1px `border-soft` separator plus 8px
  of top padding between consecutive entries. Bullet lines are 3px apart. Inside
  the sheet 2 grids the separator and its padding are dropped — the row and
  column gaps do that work instead, so the grid does not draw half a rule on one
  side of a row.
- **Line breaking:** list items and short entry summaries use `text-wrap: balance`
  so a two- or three-line bullet does not end in a one-word stub; longer prose
  uses `text-wrap: pretty`. Both are Chromium features — a reimplementation on
  another engine needs its own widow control.

### Page model

Sheets are explicit containers in the document, not a measured flow:

- Sheet 1 (`sheet--main`) is the two-column layout: a rail (about, skills,
  languages, interests) and a main column (summary, experience).
- Sheet 2 (`sheet--more`) is single-column and holds the earlier roles and
  projects as two-column grids, then education and awards at full width.

An entry moves between sheets by moving its markup between the two containers.
Four roles sit on each sheet. Sheets do not reflow into each other, so balance
them by hand after a content change.

## Elevation & Depth

Flat. Depth exists only on screen as a `0 1px 10px rgba(0,0,0,0.5)` drop shadow
under each white sheet, and it is removed in print. Separation in the document
itself is done with the 1px `border-soft` hairline and whitespace.

## Shapes

Square throughout — no corner radius on sheets, sections, or hairlines. The only
exception is the skill chip, a full pill (`9999px`) used for project technology
tags; the resume's rendered output converts project skills into a plain text line
(8.6px, `·`-separated) instead, and overrides chips in the left column to
transparent with no border. Treat the pill as an available token, not as a
pattern in current use.

## Components

- **Sheet** — white block, 786px wide, 10px accent top rule, 8/11.34/6px
  padding, 24px stack gap on screen, shadow on screen only.
- **Nameplate** — serif 35px/700, `ink-strong`, 0.2px tracking; label beneath is
  15.4px/500 in `muted`.
- **Contact row** — small accent icon in a fixed 9px column, then an 8.7px text
  value in `body-alt`; rows are 3px apart.
- **Section title** — uppercase 700 accent title plus a 5px-separated keyline.
- **Skill column** — two-column grid (equal halves, 10px column gap, 3px row gap)
  with a 1px `border-soft` divider drawn between the halves; labels render as
  8.3px text, not pills.
- **Sheet 2 grid block** — two equal columns, section title spanning both, items
  with no separator rule; used for earlier experience and projects.
- **Work entry** — company (12.4px/700 `heading`, linked), dates (9.3px/500
  `muted`, right-aligned), role (10.9px/600 `muted`), summary (10.3px `body-alt`),
  technology line (8.6px `muted`, `·`-separated), then bullets (10.7px, 13px
  indent, 3px spacing).
- **Project entry** — company/title line as above, 10px/500 description in
  `body-alt`, technology line beneath.
- **Education entry** — institution 11.2px, programme 9.9px/500 `body-alt`, dates
  and meta 9px/500 `muted`.
- **Award entry** — title, awarder and summary at 10.7px `muted`, 8px apart.

## Do's and Don'ts

- Do keep each sheet's rendered height at or under 1122.5px. The sheet has no
  clipping: overflow silently adds a PDF sheet. This is how 8 roles on one sheet
  produced a 3-sheet PDF.
- Do treat sheet 2 as the binding constraint — it runs within ~40px of the limit,
  so re-measure both sheets after any content or type change.
- Do move history between sheets by moving markup between `sheet--main` and
  `sheet--more` rather than by deleting content.
- Do keep the accent for the top rule, section titles, keylines, and icons only —
  no accent fills, no accent body text.
- Do preserve `break-inside: avoid` on entries, projects, education, and awards,
  and `break-before: page` on every sheet but the first; a page break inside an
  entry is the one failure mode readers notice.
- Don't add webfonts or remote `@font-face`; the pipeline strips them and the
  metric stability of the sheet depends on system stacks.
- Don't render text below 7.8px, and don't shrink information-carrying text below
  8.6px to gain space — move content to the next sheet instead.
- Don't put more than four entries in a sheet 2 grid row pair without
  re-measuring; an odd item count leaves a gap in the last row, which is fine
  above a following section but should not be the end of the document.
- Don't mix serif into body copy; the serif is the nameplate's alone.
- Don't introduce boxes, cards, or shadows in print.

## Reference implementation

`src/resume.html` is the implementation of this spec: one self-contained file with
no framework, no build step, and no network fonts. It carries the content, the
tokens above, the two-sheet structure, and the profile photo as a data URI, so it
can be edited directly, opened in a browser, and printed to PDF from the print
dialog. `src/cover-letter.html` applies the same tokens to a one-sheet letter.

PDF export takes a local file or a served URL (`just pdf-file`, or `PDF_INPUT` /
`PDF_OUTPUT`). Both routes yield identical PDF text; the served route only adds a
server and a network hop, so the local file is the default.
