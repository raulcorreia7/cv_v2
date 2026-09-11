# Applying with this CV

The published CV stays generic. Each application gets a copy that mirrors the posting's
own wording, because the strongest field evidence rewards content that matches what the
posting asks for, not keyword density.

## Per application

1. Make a working copy:

   ```bash
   just tailor <company-or-role-slug>
   ```

   This copies both documents into `tmp/applications/<slug>/`. The directory is scratch,
   so the published CV is never touched.

2. Find the posting's terms that the CV does not carry yet:

   ```bash
   just coverage /path/to/posting.txt
   ```

   Save the posting text first, or pass a URL. The report lists terms by frequency. It
   reads only, never edits.

3. Edit the copy. For each term worth answering, add the real experience behind it to an
   existing bullet or the technology line. Wording to prefer, in order:
   - the posting's exact term inside a bullet that already describes that work
   - the term in the technology line, if the work only touched it briefly
   - nothing, if the experience is not real

   Never add a keyword the work does not support. Interviewers ask.

4. Rewrite the summary's first line and the cover letter's first paragraph to name the
   role you are applying for. That is the whole tailoring pass; the rest of either
   document stays as published.

5. Export both files, and a parse-friendly copy of the CV:

   ```bash
   just pdf-file tmp/applications/<slug>/resume.html tmp/applications/<slug>/resume.pdf
   just pdf-file tmp/applications/<slug>/cover-letter.html tmp/applications/<slug>/cover-letter.pdf
   PDF_ATS=1 PDF_INPUT=tmp/applications/<slug>/resume.html PDF_OUTPUT=tmp/applications/<slug>/resume-ats.pdf \
     bun scripts/export-pdf.ts
   ```

   Send `resume-ats.pdf` when the employer's portal parses the file, which is how large
   employers screen. It is the same content in one column, so the text extracts in reading
   order instead of interleaving the sidebar with the experience entries. Send
   `resume.pdf` when a person receives it directly: the two-column layout is easier to
   scan, and it is what the site publishes.

6. Run the copy check before sending anything:

   ```bash
   just check
   ```

## What not to do

- Do not add a keyword block, a hidden-text layer, or a white-on-white section. It has no
  demonstrated effect on real recruitment systems, and it becomes visible the moment the
  document is copied as text.
- Do not inflate a short role. The dates show the tenure.
- Do not send the published PDF when the posting names a technology the CV omits. A
  tailored copy exists for that.
- Do not let the tailored copies accumulate as the only record of a claim. Anything true
  belongs in `src/resume.html` too.

## Tracking

The PDF and HTML share the same source, so a claim added in one application can be
promoted back into `src/resume.html` when it holds generally. That keeps the published CV
and the applied variants from drifting apart.
