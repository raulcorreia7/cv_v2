import { readFile } from "node:fs/promises";

/**
 * Reports which of a posting's terms are missing from the CV, for tailoring.
 *
 * Usage: bun scripts/check-coverage.ts <file.html|file.txt|https://url>
 *
 * It reads and reports only. It never edits the CV, because rewriting text to raise a
 * coverage number is exactly the keyword chasing the evidence does not reward. Use the
 * output to decide which real experience to describe in the posting's vocabulary.
 */

const FILLER: Record<string, true> = Object.fromEntries(
  `a an the and or but if then than that this these those for with without within from into onto over under
   you your yours we our ours us they their them it its is are was were be been being have has had do does did
   will would can could should may might must about across after before between during more most other some such
   only own same so too very not no nor as at by in of on to up via per plus etc ie eg
   job role roles position positions candidate candidates applicant applicants team teams work working works
   experience experiences year years month months day days week weeks strong good great excellent ability able
   skills skill knowledge understanding familiar familiarity plus preferred required requirement requirements
   responsibilities responsibility including include includes included help helps helping support supporting
   environment environments company companies business businesses client clients customer customers product products
   service services project projects using use used new modern best practices practice practices level senior
   junior mid lead leading manager management engineer engineering developer development software
   you'll we're we'll it's don't won't can't
   hands-on looking look nice mentor mentoring join joining apply application opportunity growth culture
   remote hybrid onsite office salary benefits perks offer offers contract freelance fulltime parttime
   please send email contact hiring hire who what when where why how`
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => [word, true as const]),
);

const source = process.argv[2];

if (!source) {
  console.error("usage: bun scripts/check-coverage.ts <file|url>");
  process.exit(2);
}

const readSource = async (): Promise<string> => {
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source);

    if (!response.ok) {
      throw new Error(`fetch failed: ${response.status} ${source}`);
    }

    return response.text();
  }

  return readFile(source, "utf8");
};

const toText = (html: string): string =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");

const posting = toText(await readSource());
const cv = toText(await readFile(process.env.CV_INPUT ?? "tmp/resume.html", "utf8")).toLowerCase();

const tokens = posting.match(/[A-Za-z][A-Za-z0-9+#./-]*/g) ?? [];
const counts = new Map<string, number>();

for (const raw of tokens) {
  const token = raw.replace(/[.,;:]+$/, "");
  const key = token.toLowerCase();

  if (key.length < 2 || FILLER[key] === true || /^\d+$/.test(key)) {
    continue;
  }

  counts.set(token, (counts.get(token) ?? 0) + 1);
}

const missing = [...counts.entries()]
  .filter(([token]) => !cv.includes(token.toLowerCase()))
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

console.log(`${missing.length} posting terms absent from the CV (top 40 by frequency):\n`);

for (const [token, count] of missing.slice(0, 40)) {
  console.log(`  ${String(count).padStart(3)}x  ${token}`);
}

console.log(
  "\nAdd a term only when the experience behind it is real. Prefer the posting's own wording inside an existing bullet over a new keyword line.",
);
