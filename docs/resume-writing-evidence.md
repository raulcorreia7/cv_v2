# CV writing: what the evidence actually supports

Research note for `src/resume.html`. Every claim below was traced to the source that
owns it and fetched on 2026-09-11. Resume advice is full of numbers that nobody can
source, so each item carries an evidence label:

- **strong**: peer-reviewed study, large-sample institutional research, or a vendor's
  own product documentation describing how the product behaves
- **moderate**: single vendor-run study, or institutional guidance with no data
- **weak**: vendor marketing, small samples, or a proof of concept

Conflict between sources is stated rather than averaged. Where no reliable evidence
exists in either direction, the note says so.

## 1. The first screen is a scan, not a read

| Finding | Number | Source | Label |
|---|---|---|---|
| Recruiters spent about 80% of a first pass on six fields: name, current title and company, previous title and company, current dates, previous dates, education. Everything else was keyword scanning | ~6 s, n=30 recruiters, 10 weeks | [Ladders eye-tracking white paper, 2012 edition](https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf) | weak |
| Ladders later reported a longer average first pass | 7.4 s | [Ladders press release, 2018](https://www.prnewswire.com/news-releases/ladders-updates-popular-recruiter-eye-tracking-study-with-new-key-insights-on-how-job-seekers-can-improve-their-resumes-300744217.html) | weak |
| A university career centre gives a different range, with no citation | 15 to 30 s | [UCLA Career Center](https://career.ucla.edu/resources/resumes-cover-letters/) | moderate |
| Peer-reviewed eye tracking: gaze alone predicts advancement; time on Experience and Education carry the signal | AUC 0.767 | [Pina et al., MAKE 5(3), 2023](https://doi.org/10.3390/make5030038) | strong |

The Ladders figure is the most quoted number in resume advice and the weakest. Its
retrievable white paper is the 2012 edition with 30 recruiters, it ends by selling a
$395 rewrite service, and the 2018 update exists only as a press release with no
published method ([Forbes critique, 2012](https://www.forbes.com/sites/susanadams/2012/03/26/what-your-resume-is-up-against/)).
Use it as a design constraint, not a fact: the first pass reads titles, employers,
dates and education, so those must be findable without reading a bullet.

**Applied:** every entry already leads with company, dates and position. Keep it that way,
and never bury a title or a date inside prose.

## 2. Two pages is right, one page is folklore

| Guidance | Length | Source | Label |
|---|---|---|---|
| EU standard CV tool: "in most cases, two pages are enough" | 2 pages | [Europass CV instructions (EU)](https://www.eeas.europa.eu/sites/default/files/europass_cv_instructions.pdf) | moderate, dated |
| German Federal Employment Agency: CV "should not be longer than two pages" | 2 pages | [Arbeitsagentur, 2026](https://www.arbeitsagentur.de/vor-ort/zav/working-and-living-in-germany/iss-en/issue-01-2026/application-cv) | moderate |
| Dutch university career service: "maximaal twee A4" | 2 pages | [Radboud University Career Service](https://www.ru.nl/sites/default/files/2023-03/Career%20Service%20Hand-out%20CV_NL.pdf) | moderate |
| Dutch central government employer: CV "no longer than two A4", key achievements on page 1 | 2 pages | [Werken voor Nederland (Rijksoverheid)](https://www.werkenvoornederland.nl/over-de-rijksoverheid/solliciteren-bij-de-rijksoverheid/hoe-maak-je-een-sterk-cv) | moderate |
| Hiring simulation: two-page resumes chosen more often than one-page, rising with seniority (1.4x entry, 2.6x mid, 2.9x managerial) | 2.3x, n=482 | [ResumeGo](https://www.resumego.net/research/one-or-two-page-resumes/) | weak to moderate |

No source found states a one-page maximum for an experienced hire. The only study
that contradicts the two-page preference is platform data from Jobscan, where shorter
resumes did better for *entry-level* candidates (17.9% vs 2.8% interview rate between
the shortest and longest quartile) and the senior sample was too small to conclude
anything ([Jobscan, 2026](https://www.jobscan.co/blog/page-length-is-not-what-recruiters-say-they-prefer/)).

**Applied:** two A4 pages is the defensible default. The rule that matters is evidence
density, not page count: both sheets should carry targeted, non-repeated content.

## 3. Layout, parsing, and the one real defect in this CV

ATS vendors document their own parse behaviour, which makes this the best-evidenced
area of the whole note.

- **Workday** tells integrators to "avoid tabular and column formats" and to avoid
  images, text boxes and logos, and accepts DOCX and text-based PDF only
  ([Workday Resume REST API](https://developer.workday.com/documentation/GUID-f07adb7f-630e-42a2-9de9-a39652e34ec5-enHYPHENus/ResumeRESTAPI)). Its parsing concept page adds that
  results vary with format and word order
  ([Workday admin guide](https://doc.workday.com/admin-guide/en-us/human-capital-management/recruiting/candidates/set-up-prospects-and-candidates/hdc1552497830785.html)).
- **Greenhouse** lists "a columned layout", tables, headers and footers, graphics, and
  contact details placed in a header as causes of a failed or partial parse. The
  consequence is not rejection: the resume is attached and typed in by hand
  ([Greenhouse](https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse)).
- Two-column parsing degrades in vendor testing, worst for the skills section: 93%
  single-column against 86% two-column overall, 65% against 46% for skills
  ([Enhancv test](https://enhancv.com/blog/busting-ats-myths/), vendor, weak).
- **Format**: Greenhouse recommends PDF explicitly, and Lever accepts pdf, docx and doc
  ([Greenhouse formats](https://support.greenhouse.io/hc/en-us/articles/360052218132-Supported-formats-for-resumes-cover-letters-and-other-candidate-uploads),
  [Lever](https://hire.lever.co/developer/documentation)). Image-based PDFs are the only
  format that genuinely fails.

**Measured on this CV.** The visual PDF keeps the two-column layout, and its text layer
interleaves the rail with the main column. Extraction mixes the skills list into an
experience entry: `EXPERIENCE`, `CLOUD & DEVOPS`, `Forbion`, `AWS`, `AWS Lambda`,
`Senior Software Engineer` and so on.

Reordering the DOM does not fix this. The first attempt moved the main column ahead of the
rail and placed the rail with CSS grid; the rendered sheets were identical, and the
extracted order did not change, because the PDF writer places text by position on the page
rather than by source order. The measurement is what settled it:

```
$ pdftotext tmp/resume.pdf - | sed -n '1,24p'    # visual export: interleaved
$ just pdf-ats && pdftotext tmp/resume-ats.pdf - # single column: reads in order
```

The fix that works is a second export. `just pdf-ats` collapses the sheet body to one
column, lays the rail blocks side by side, and drops the forced sheet break, so the text
reads summary, experience, then skills, languages and interests, in two pages. The visual
PDF stays for humans and for direct sharing; the single-column PDF goes to portals.

## 4. Content that changes outcomes

| Finding | Number | Source | Label |
|---|---|---|---|
| Listing jobs as years worked instead of dates raised callbacks; the effect grew for applicants with employment gaps | +8% / +15%, n=9,022 applications | [Kristal et al., Nature Human Behaviour 7, 2023](https://www.nature.com/articles/s41562-022-01485-6) | strong |
| Resume content that matches the posting's skill requirements drew callbacks far more often | 19.1% vs 3.9%, n=2,400 | [Mihut, Studies in Higher Education, 2021](https://www.esri.ie/system/files/publications/JA202103_0.pdf) | strong, entry-level roles |
| Higher perceived resume quality drew more callbacks | +30%, bundled treatment | [Bertrand & Mullainathan, NBER w9873, 2003](https://www.nber.org/papers/w9873) | strong, dated |
| Recruiter-rated letter quality rose with AI help but interview invitations did not | two field experiments | [Abbas Nejad et al., Journal of Labor Economics, 2026](https://research.tilburguniversity.edu/en/publications/labor-market-signals-the-role-of-large-language-models-2/) | strong |
| Tailored letters associated with more callbacks than none | +53%, n=7,287 applications | [ResumeGo](https://www.resumego.net/research/cover-letters/) | weak to moderate, vendor |

**Quantification has no controlled evidence behind it.** Google's own guidance states
the XYZ formula, "Accomplished [X] as measured by [Y] by doing [Z]", and tells writers to
quantify with "actual numbers, percentages, dollar values, and volumes"
([Google resume guidance PDF, 2021](https://services.google.com/fh/files/misc/resume-writing-tips-for-veterans-2021.pdf)).
No field experiment found isolates quantified bullets as the treatment and measures
callbacks. Google's instruction is worth following anyway, because it forces a bullet to
name an outcome, and it costs one clause.

The strongest *causal* evidence in this area is about salience rather than numbers:
presenting experience in years, as Kristal et al. did, moved real callbacks. That is a
reason to state durations and scale in text, not only as dates.

**Where no number exists**, institutional guidance recommends the substitutes: cadence,
team size, services owned, traffic volume, incident counts, and honest approximations
such as "weekly" or "over 75" ([UC San Diego](https://career.ucsd.edu/resources/guides/resume.html),
[UC Davis](https://careercenter.ucdavis.edu/resumes-and-materials/resumes/accomplishment-statements),
[Google](https://services.google.com/fh/files/misc/resume-writing-tips-for-veterans-2021.pdf)).

## 5. Errors cost more than any formatting choice

A recruiter experiment with 445 participants found error-laden resumes drew an 18.5
percentage point lower interview probability, and resumes with two errors 7.3 points
lower, with about half the penalty explained by perceived conscientiousness and mental
ability ([Sterkens et al., PLOS ONE, 2023](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0283280), strong).

This is the largest measured effect in the entire note, and it is the cheapest to control:
proofread the exported PDF, not the HTML source.

## 6. Myths, with their provenance

| Claim | Verdict | What it rests on |
|---|---|---|
| "ATS rejects 75% of CVs before a human sees them" | Unsupported | A 2012 [Computerworld article](https://www.computerworld.com/article/1458323/5-insider-secrets-for-beating-applicant-tracking-systems.html) quoting Preptel, a vendor selling ATS-optimisation software. No method, no sample. |
| "A CV must be one page" | Unsupported | No institutional source found states it. EU and German guidance says two. |
| "Any ATS can auto-reject on keywords or design" | Unsupported for keywords | Auto-reject is documented from application-form answers and eligibility rules: [Greenhouse](https://support.greenhouse.io/hc/en-us/articles/360000653472-Auto-reject), [Ashby](https://docs.ashbyhq.com/auto-reject-applications), [Workday](https://doc.workday.com/admin-guide/en-us/human-capital-management/recruiting/candidates/prospect-and-candidate-management/uwd1485375819245.html). Greenhouse states its matching "does not automatically advance or reject candidates" ([bias audit statement](https://www.greenhouse.com/bias-audit-statement)). |
| "Keyword stuffing improves ranking" | Unsupported | The only demonstration is a reranking attack on research models no employer runs ([arXiv 2108.05490](https://arxiv.org/abs/2108.05490)). The US federal jobs site states keyword screening is followed by human verification ([USAJOBS](https://help.usajobs.gov/working-in-government/myths/resume-scanned-for-keywords)). |
| "PDFs are rejected in favour of DOCX" | False | Greenhouse answers the question with "Upload a PDF for best results". |
| "Photos and dates of birth are required in the EU" | Unsupported | Europass marks both optional. |
| "Photos are standard in the Netherlands" | Unsupported | Dutch guidance says a photo is not required; Dutch privacy rules bar employers asking for private data. |
| "Photos are standard in Germany" | Mixed | The Federal Employment Agency says a photo "is still expected by most employers" but "not mandatory", and that marital status is not required. |
| "250 resumes per opening" | Untraceable | Published by Glassdoor (2015) and ERE (2013) with no methodology. |
| "Skills-based hiring replaced keyword screening" | Unsupported | Of roles where degree requirements were removed, fewer than 1 in 700 hires changed, and degree requirements have been rising since March 2024 ([HBS and Burning Glass](https://pw.hks.harvard.edu/post/skills-based-hiring-the-long-road-from-pronouncements-to-practice), [Indeed Hiring Lab](https://hiringlab.indeed.com/2026/01/28/where-do-college-degrees-still-matter-in-a-skills-first-job-market/)). |

What *is* documented, at scale: over 90% of surveyed employers filter or rank candidates
in their recruitment system before a human reviews, and 88% agree qualified candidates
get screened out for not matching exact job-description criteria
([HBS and Accenture, Hidden Workers, 2021](https://www.hbs.edu/ris/Publication%20Files/hiddenworkers09032021_Fuller_white_paper_33a2047f-41dd-47b1-9a8d-bd08cf3bfa94.pdf)).

## 7. Where this CV stands

Measured on the current build (2026-09-11):

| Check | Guidance | Current | Verdict |
|---|---|---|---|
| Length | 2 A4 pages for a senior engineer | 2 pages, 942px and 996px of 1122.5px | pass |
| Sheet 2 substance | Page 2 must earn its place | 4 roles, 5 projects, education, awards | pass |
| Bullet length | 1 to 2 rendered lines | mean 75 characters, longest 156 | pass |
| Bullets per role | 3 to 5 per role | Forbion 5; Shell roles 7 and 7; TM-Pro 6; older roles 3 | over on three roles |
| Quantified bullets | Google: numbers, volumes, baselines | 6 of 37 bullets contain a number | weak |
| Opening verb | Start with an action verb, no "responsible for" | 97% start with a past-tense verb; "Built" opens 9 of 37 | pass, repetitive verb |
| Photo, date of birth, marital status | Omit in the Netherlands | none present | pass |
| File format | Text-based PDF | selectable text, no rasterisation | pass |
| PDF text order | Single column reads cleanly | visual PDF interleaves; `resume-ats.pdf` reads in order | handled by the ATS export, see section 3 |
| Typo risk | Largest measured penalty | not yet checked mechanically | untested |

## 8. Follow-up, in priority order

Each item states what it costs and how to tell it worked. Items 1 to 3 are local edits;
4 to 6 are small tooling; 7 is a decision for the author.

1. ~~Fix the PDF text order.~~ **Done.** `just pdf-ats` writes a single-column export
   that reads summary, experience, skills; the visual PDF is unchanged. See section 3.
2. ~~Trim the three over-long roles to 5 bullets.~~ **Done.** Every role now holds 3 to 5
   bullets; the stack detail the dropped lines carried survives in the technology lines.
3. **Raise the quantified-bullet share.** Target 12 of 37 bullets carrying a number,
   scale, or frequency. Sources for honest ones: team size, services owned, request or
   data volume, release cadence, incident counts, review time. Cost: a pass over the
   bullets with the author, since only the author knows the figures. Acceptance: no
   invented precision, and each number is defensible in an interview.
4. **Add a tailoring pass per application.** The strongest field evidence rewards content
   that matches the posting. Cost: a documented one-command flow that copies
   `resume.html`, and re-exports the PDF and letter. Acceptance: a checked-in short
   checklist plus a `just` recipe, and no change to the published CV.
5. **Add a posting-coverage check.** Given a posting URL or text, report which of its
   named terms appear in the CV and which do not. Cost: a small script next to
   `build-site.ts`. Acceptance: it finds canonical terms such as "PostgreSQL" or
   "Kubernetes" that are missing, and never edits the CV itself.
6. **Add a proofreading gate.** Extract text from the exported PDF and flag doubled
   words, double spaces, inconsistent date formats, and passive phrases such as
   "responsible for". Cost: a small script. Acceptance: it runs as part of `just pdf`
   and fails loudly on a hit.
7. ~~Decide on duration salience.~~ **Done.** Every work entry shows its length
   under the dates, which is what the salience study rewards. Shell Recharge held
   two consecutive roles, so the combined tenure (3 yr 1 mos) sits once on the most
   recent entry and the earlier entry carries no duration, which avoids counting the
   same months twice and avoids presenting one employer as two short stints.

Not recommended, on the evidence: keyword blocks, a one-page rewrite, switching to DOCX,
adding a photo or date of birth, or chasing an ATS "score".

## Sources

Fetched 2026-09-11. Vendor material is labelled as such; paywalled or blocked sources are
noted where a claim depends on their metadata only.

- Ladders, [Eye-Tracking Study, 2012 edition](https://www.bu.edu/com/files/2018/10/TheLadders-EyeTracking-StudyC2.pdf) (original returned HTTP 403); [2018 press release](https://www.prnewswire.com/news-releases/ladders-updates-popular-recruiter-eye-tracking-study-with-new-key-insights-on-how-job-seekers-can-improve-their-resumes-300744217.html); [Forbes coverage and critique](https://www.forbes.com/sites/susanadams/2012/03/26/what-your-resume-is-up-against/)
- Pina et al., [Predicting recruiter approval from eye tracking](https://doi.org/10.3390/make5030038), MAKE 5(3), 2023
- Lahey & Oxley, [Discrimination at the intersection of age, race and gender](https://doi.org/10.1002/pam.22281), JPAM 40(4), 2021
- Kristal et al., [The effects of resume salience](https://www.nature.com/articles/s41562-022-01485-6), Nature Human Behaviour 7, 2023
- Bertrand & Mullainathan, [Are Emily and Greg more employable than Lakisha and Jamal?](https://www.nber.org/papers/w9873), NBER w9873, 2003
- Sterkens et al., [Resume errors and interview probability](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0283280), PLOS ONE 18(4), 2023
- Mihut, [The role of skill match in callbacks](https://www.esri.ie/system/files/publications/JA202103_0.pdf), Studies in Higher Education, 2021
- Abbas Nejad et al., [Labor market signals: the role of large language models](https://research.tilburguniversity.edu/en/publications/labor-market-signals-the-role-of-large-language-models-2/), Journal of Labor Economics, 2026
- Google, [Resume-writing tips](https://services.google.com/fh/files/misc/resume-writing-tips-for-veterans-2021.pdf), 2021
- HBS and Accenture, [Hidden Workers: Untapped Talent](https://www.hbs.edu/ris/Publication%20Files/hiddenworkers09032021_Fuller_white_paper_33a2047f-41dd-47b1-9a8d-bd08cf3bfa94.pdf), 2021
- HBS and Burning Glass, [Skills-based hiring](https://pw.hks.harvard.edu/post/skills-based-hiring-the-long-road-from-pronouncements-to-practice); Indeed Hiring Lab, [Where degrees still matter](https://hiringlab.indeed.com/2026/01/28/where-do-college-degrees-still-matter-in-a-skills-first-job-market/), 2026
- Workday, [Resume REST API guidelines](https://developer.workday.com/documentation/GUID-f07adb7f-630e-42a2-9de9-a39652e34ec5-enHYPHENus/ResumeRESTAPI) and [resume parsing concept](https://doc.workday.com/admin-guide/en-us/human-capital-management/recruiting/candidates/set-up-prospects-and-candidates/hdc1552497830785.html)
- Greenhouse, [unsuccessful parses](https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse), [supported formats](https://support.greenhouse.io/hc/en-us/articles/360052218132-Supported-formats-for-resumes-cover-letters-and-other-candidate-uploads), [auto-reject](https://support.greenhouse.io/hc/en-us/articles/360000653472-Auto-reject), [Boolean search](https://support.greenhouse.io/hc/en-us/articles/202360199-Search-candidates-using-Boolean-queries), [bias audit statement](https://www.greenhouse.com/bias-audit-statement)
- Ashby, [candidate search semantics](https://docs.ashbyhq.com/candidate-search), [auto-reject](https://docs.ashbyhq.com/auto-reject-applications)
- Lever, [developer documentation](https://hire.lever.co/developer/documentation)
- Europass, [CV instructions](https://www.eeas.europa.eu/sites/default/files/europass_cv_instructions.pdf); Arbeitsagentur, [application and CV guide](https://www.arbeitsagentur.de/vor-ort/zav/working-and-living-in-germany/iss-en/issue-01-2026/application-cv); Radboud University, [CV handout (NL)](https://www.ru.nl/sites/default/files/2023-03/Career%20Service%20Hand-out%20CV_NL.pdf); Rijksoverheid, [a strong CV](https://www.werkenvoornederland.nl/over-de-rijksoverheid/solliciteren-bij-de-rijksoverheid/hoe-maak-je-een-sterk-cv); Erasmus University Rotterdam, [CV guide](https://www.eur.nl/en/media/2023-08-2-curriculum-vitae-en)
- UCLA, [resumes and cover letters](https://career.ucla.edu/resources/resumes-cover-letters/); CU Boulder, [develop your materials](https://www.colorado.edu/career/alumni/job-search-tools/develop-your-materials); Purdue OWL, [two pages or more](https://owl.purdue.edu/owl/job_search_writing/resumes_and_vitas/using_two_pages_or_more.html); UConn, [writing bullet points](https://career.uconn.edu/writing-bullet-points/); UW-Madison, [resume guide](https://careercenter.education.wisc.edu/prepare-apply/resume/); UC San Diego, [resume guide](https://career.ucsd.edu/resources/guides/resume.html); UC Davis, [accomplishment statements](https://careercenter.ucdavis.edu/resumes-and-materials/resumes/accomplishment-statements)
- ResumeGo, [one or two pages](https://www.resumego.net/research/one-or-two-page-resumes/) and [cover letters](https://www.resumego.net/research/cover-letters/); Jobscan, [page length](https://www.jobscan.co/blog/page-length-is-not-what-recruiters-say-they-prefer/); Enhancv, [ATS myth tests](https://enhancv.com/blog/busting-ats-myths/); Kickresume, [application experiment](https://www.kickresume.com/en/press/job-application-experiment/); Lyngo Lab, [bullet line spillover](https://www.lyngolab.com/resume-bullets-lines.html)
- Computerworld, [origins of the 75% claim](https://www.computerworld.com/article/1458323/5-insider-secrets-for-beating-applicant-tracking-systems.html); USAJOBS, [keyword screening](https://help.usajobs.gov/working-in-government/myths/resume-scanned-for-keywords); arXiv, [ranking attacks on recruitment models](https://arxiv.org/abs/2108.05490)
