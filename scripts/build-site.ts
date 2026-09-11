import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

import { exportPdf } from "./export-pdf";

const root = process.cwd();
const source = path.join(root, "src/resume.html");
const outputDir = path.join(root, "output");

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

await exportPdf(source, path.join(outputDir, "resume.pdf"));
await cp(source, path.join(outputDir, "resume.html"));
await cp(source, path.join(outputDir, "index.html"));

console.log("Site written to output/: index.html, resume.html, resume.pdf");
