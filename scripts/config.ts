import path from "node:path";

export type BuildConfig = {
  assetsDir: string;
  colorVariant: string;
  coverLetterFile: string;
  outputDir: string;
  outputHtml: string;
  outputIndexHtml: string;
  outputLetterHtml: string;
  outputLetterPdf: string;
  outputPdf: string;
  port: number;
  resumeFile: string;
  resumeJsonPath: string;
  resumeSourcePath: string;
  serverPidPath: string;
  templateDir: string;
  theme: string;
};

export function resolveConfig(overrides: Partial<BuildConfig> = {}): BuildConfig {
  const outputDir = overrides.outputDir ?? process.env.OUTPUT_DIR ?? "tmp";
  const templateDir = overrides.templateDir ?? process.env.TEMPLATE_DIR ?? "src/template";
  const assetsDir = overrides.assetsDir ?? process.env.ASSETS_DIR ?? "src/assets";
  const colorVariant = overrides.colorVariant ?? process.env.RESUME_COLOR_VARIANT ?? "slate-green";
  const resumeFile = overrides.resumeFile ?? process.env.RESUME_FILE ?? "resume.json";
  const theme = overrides.theme ?? process.env.THEME ?? "jsonresume-theme-macchiato";
  const coverLetterFile =
    overrides.coverLetterFile ?? process.env.COVER_LETTER_FILE ?? path.join(templateDir, "cover-letter.json");
  const outputHtml = overrides.outputHtml ?? process.env.OUTPUT_HTML ?? path.join(outputDir, "resume.html");
  const outputIndexHtml = overrides.outputIndexHtml ?? path.join(outputDir, "index.html");
  const outputPdf = overrides.outputPdf ?? process.env.OUTPUT_PDF ?? path.join(outputDir, "resume.pdf");
  const outputLetterHtml =
    overrides.outputLetterHtml ?? process.env.OUTPUT_LETTER_HTML ?? path.join(outputDir, "cover-letter.html");
  const outputLetterPdf =
    overrides.outputLetterPdf ?? process.env.OUTPUT_LETTER_PDF ?? path.join(outputDir, "cover-letter.pdf");
  const parsedPort = Number(overrides.port ?? process.env.PORT ?? 8080);
  const port = Number.isFinite(parsedPort) ? parsedPort : 8080;

  return {
    assetsDir,
    colorVariant,
    coverLetterFile,
    outputDir,
    outputHtml,
    outputIndexHtml,
    outputLetterHtml,
    outputLetterPdf,
    outputPdf,
    port,
    resumeFile,
    resumeJsonPath: path.join(outputDir, resumeFile),
    resumeSourcePath: path.join(templateDir, resumeFile),
    serverPidPath: path.join(outputDir, ".resume-server.pid"),
    templateDir,
    theme,
  };
}
