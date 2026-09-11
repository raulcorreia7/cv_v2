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
    fontSize: 15.1px
    fontWeight: 500
    lineHeight: 1.1
  section-title:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 11.8px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: 0.45px
  section-title-secondary:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 11.9px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: 0.5px
  left-section-title:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 10.2px
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: 0.38px
  entry-company:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: 0.4px
  entry-role:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 9.9px
    fontWeight: 600
    lineHeight: 1.16
  entry-dates:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 8.7px
    fontWeight: 500
    lineHeight: 1.08
  body:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 10px
    fontWeight: 400
    lineHeight: 1.21
  entry-summary:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 9.5px
    fontWeight: 400
    lineHeight: 1.22
  tech-line:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 7.8px
    fontWeight: 400
    lineHeight: 1.14
    letterSpacing: 0.08px
  left-body:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 8px
    fontWeight: 400
    lineHeight: 1.18
  skill-chip:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 7.2px
    fontWeight: 500
    lineHeight: 1.12
  project-title:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 9.45px
    fontWeight: 500
    lineHeight: 1.24
  education-program:
    fontFamily: "Aptos, Segoe UI, Noto Sans, Liberation Sans, Arial, sans-serif"
    fontSize: 9.35px
    fontWeight: 500
    lineHeight: 1.18
spacing:
  a4-sheet-height: 1122.5px
  page-width: 763.45px
  page-padding-top: 8px
  page-padding-inline: 11.34px
  page-padding-bottom: 6px
  page-rule: 10px
  page-gap: 24px
  left-column-width: 118px
  left-column-gap: 8px
  section-gap: 10px
  container-gap: 6px
  entry-gap: 8px
  entry-separator-gap: 6px
  entry-line-gap: 2px
  keyline-width: 42px
  keyline-margin: 4px
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
compact system-sans at very small sizes so a full career history fits A4 without
looking cramped. Hierarchy comes from weight, letter-spacing, and one accent
colour — never from boxes, shadows, or fills. Screen rendering is a preview; the
PDF is the artefact, and every layout decision is bound to A4 geometry rather
than to a viewport.

Reference output: `tmp/resume.html` (screen) and `tmp/resume.pdf` (2 sheets).
Current fit: sheet 1 content = 1004px, sheet 2 = 868px against a 1122.5px sheet.

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
  from the 15.1px role label down to the 7.2px chip.
- **Section titles** are uppercase, 700, and letter-spaced (0.45px), coloured with
  the accent. This letter-spacing is what makes an 11.8px title read as a heading,
  so a reimplementation must keep it.
- **Body copy runs at 10px / 1.21**, entry summaries at 9.5px, the technology line
  at 7.8px, left-column values at 8px. Sizes under 10px are deliberate: they buy
  the sheet its capacity. Sub-10px text is only acceptable because the PDF is
  printed and zoomed, never read at 100% on a low-DPI screen.

Sheet 2 runs slightly larger titles (11.9px, 0.5px tracking) because it carries
fewer, denser blocks.

## Layout

Fixed A4 geometry, not a responsive grid.

- **Sheet:** 202mm wide (= 763.45px) with a 10px accent rule along the top edge,
  padding 8px top / 3mm (11.34px) inline / 6px bottom. Screens stack sheets with a
  24px gap; print repaginates them.
- **Print margin:** `@page { size: A4; margin: 3mm 0 }` — the inline mm is supplied
  by the printer margin, not by page padding, which is why padding declares the
  same 11.34px explicitly.
- **Two columns on sheet 1:** left 118px (profile, skills, languages, interests),
  right fluid (summary, experience) — 8px gutter between them. Sheet 2 is
  single-column at full width.
- **Hero:** name and role label on the left of the header, a 44px circular photo
  with a 2px accent border on the right.
- **Sections** are separated by 6px of top padding plus a title with a 4px keyline
  under it (42px wide, 1px accent hairline; 32px in the left column).
- **Entries** stack with an 8px margin and a 1px `border-soft` separator plus 6px
  of top padding between consecutive entries. Bullet lines are 2px apart.

### Page model

Content is assigned to sheets by an explicit token list, not by content
measurement. Each sheet declares ordered `left`/`right` tokens; a work token
selects a bucket of entries:

- `summary`, `about`, `skills`, `languages`, `interests`, `projects`,
  `education`, `awards`, `volunteer`, `references` — whole sections.
- `work:core`, `work:secondary` — entries whose `x-layout.page` matches. An entry
  without a marker is treated as `secondary`.
- `work:all` — every entry on one sheet. Also enables a condensed treatment for
  `secondary` entries: bullets trimmed to two, 2px margins, an 8.95px summary.

Current assignment: sheet 1 = `summary` + `work:core` (5 recent roles, 1004px);
sheet 2 = `work:secondary` (3 older roles) + projects + education + awards
(868px). Moving history between sheets is a JSON change only.

## Elevation & Depth

Flat. Depth exists only on screen as a `0 1px 10px rgba(0,0,0,0.5)` drop shadow
under each white sheet, and it is removed in print. Separation in the document
itself is done with the 1px `border-soft` hairline and whitespace.

## Shapes

Square throughout — no corner radius on sheets, sections, or hairlines. The only
exception is the skill chip, a full pill (`9999px`) used for project technology
tags; the resume's rendered output converts project skills into a plain text line
(7.8px, `·`-separated) instead, and overrides chips in the left column to
transparent with no border. Treat the pill as an available token, not as a
pattern in current use.

## Components

- **Sheet** — white block, 763.45px wide, 10px accent top rule, 8/11.34/6px
  padding, 24px stack gap on screen, shadow on screen only.
- **Nameplate** — serif 35px/700, `ink-strong`, 0.2px tracking; label beneath is
  15.1px/500 in `muted`.
- **Contact row** — small accent icon in a fixed 9px column, then an 8px text
  value in `body-alt`; rows are 2px apart.
- **Section title** — uppercase 700 accent title plus a 4px-separated keyline.
- **Skill column** — two-column grid (equal halves, 10px column gap, 3px row gap)
  with a 1px `border-soft` divider drawn between the halves; labels render as
  7.6px text, not pills.
- **Work entry** — company (12px/700 `heading`, linked), dates (8.7px/500 `muted`,
  right-aligned), role (9.9px/600 `muted`), summary (9.5px `body-alt`), technology
  line (7.8px `muted`, `·`-separated), then bullets (10px, 12px indent, 2px
  spacing).
- **Project entry** — company/title line as above, 9.45px/500 description in
  `body-alt`, technology line beneath.
- **Education entry** — institution 10.8px, programme 9.35px/500 `body-alt`, dates
  and meta 8.45px/500 `muted`.
- **Award entry** — title, awarder and summary at 10px `muted`, 6px apart.

## Do's and Don'ts

- Do keep each sheet's rendered height at or under 1122.5px. The sheet has no
  clipping: overflow silently adds a PDF sheet. This is how 8 roles on one sheet
  produced a 3-sheet PDF.
- Do move history between sheets through `work:core` / `work:secondary` rather
  than by deleting content; `work:all` is only safe for short histories.
- Do keep the accent for the top rule, section titles, keylines, and icons only —
  no accent fills, no accent body text.
- Do preserve `break-inside: avoid` on entries, projects, education, and awards,
  and `break-before: page` on every sheet but the first; a page break inside an
  entry is the one failure mode readers notice.
- Don't add webfonts or remote `@font-face`; the pipeline strips them and the
  metric stability of the sheet depends on system stacks.
- Don't render text below 7.2px — the chip is the floor.
- Don't mix serif into body copy; the serif is the nameplate's alone.
- Don't introduce boxes, cards, or shadows in print.
