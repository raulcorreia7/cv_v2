import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

import { buildCoverLetterHtml } from "./build-letter";
import { resolveConfig, type BuildConfig } from "./config";
import { postprocessResume } from "./postprocess-resume";

const publishDir = path.resolve("output");

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function run(command: string[], label: string): Promise<void> {
  const proc = Bun.spawn(command, {
    cwd: process.cwd(),
    env: process.env,
    stderr: "inherit",
    stdout: "inherit",
  });

  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(`${label} failed with exit code ${exitCode}`);
  }
}

async function copyStaticFiles(config: BuildConfig): Promise<void> {
  await mkdir(config.outputDir, { recursive: true });

  if (await pathExists(config.assetsDir)) {
    const assetEntries = await readdir(config.assetsDir);

    await Promise.all(
      assetEntries.map((entry) =>
        cp(path.join(config.assetsDir, entry), path.join(config.outputDir, entry), {
          force: true,
          recursive: true,
        }),
      ),
    );
  }
}

export async function removeCoverLetterArtifacts(config: BuildConfig = resolveConfig()): Promise<void> {
  await rm(config.outputLetterHtml, { force: true });
  await rm(config.outputLetterPdf, { force: true });
}

function shouldSyncOutput(config: BuildConfig): boolean {
  return path.resolve(config.outputDir) === path.resolve("tmp");
}

export async function sync(config: BuildConfig = resolveConfig()): Promise<void> {
  if (!shouldSyncOutput(config)) {
    return;
  }

  await rm(publishDir, { force: true, recursive: true });
  await mkdir(publishDir, { recursive: true });

  const entries = await readdir(config.outputDir).catch(() => []);
  const ignoredEntries = new Set([path.basename(config.serverPidPath)]);

  await Promise.all(
    entries
      .filter((entry) => !ignoredEntries.has(entry))
      .map((entry) =>
        cp(path.join(config.outputDir, entry), path.join(publishDir, entry), {
          force: true,
          recursive: true,
        }),
      ),
  );
}

export async function buildResume(config: BuildConfig = resolveConfig()): Promise<void> {
  await copyStaticFiles(config);
  await rm(path.join(config.outputDir, "_redirects"), { force: true });
  await cp(config.resumeSourcePath, config.resumeJsonPath, { force: true });

  await run(
    [process.execPath, "x", "resumed", config.resumeJsonPath, "--theme", config.theme, "-o", config.outputHtml],
    "resume HTML build",
  );

  await postprocessResume(config);
  await cp(config.outputHtml, config.outputIndexHtml, { force: true });
}

export async function buildCoverLetter(config: BuildConfig = resolveConfig()): Promise<void> {
  await copyStaticFiles(config);
  await buildCoverLetterHtml(config);
}

export async function build(config: BuildConfig = resolveConfig()): Promise<void> {
  await removeCoverLetterArtifacts(config);
  await buildResume(config);
}
