import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

import { exportPdf } from "./export-pdf";
import { renderDocuments } from "./render-documents";

const root = process.cwd();
const source = path.join(root, "tmp/resume.html");
const outputDir = path.join(root, "output");

// The gates run here as well as in the justfile, so CI and the Pages release cannot
// publish unchecked code or copy.
const typecheck = Bun.spawnSync(["bun", "run", "typecheck"], { stderr: "inherit", stdout: "inherit" });

if (typecheck.exitCode !== 0) {
  console.error("type check failed, site not built");
  process.exit(1);
}

await renderDocuments();
const check = Bun.spawnSync(["bun", "scripts/check-copy.ts"], { stderr: "inherit", stdout: "inherit" });

if (check.exitCode !== 0) {
  console.error("copy check failed, site not built");
  process.exit(1);
}

const layoutCheck = Bun.spawnSync(["bun", "scripts/check-layout.ts"], { stderr: "inherit", stdout: "inherit" });

if (layoutCheck.exitCode !== 0) {
  console.error("layout check failed, site not built");
  process.exit(1);
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

await exportPdf(source, path.join(outputDir, "resume.pdf"));
await cp(source, path.join(outputDir, "resume.html"));
await cp(source, path.join(outputDir, "index.html"));

console.log("Site written to output/: index.html, resume.html, resume.pdf");
