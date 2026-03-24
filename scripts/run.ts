import { readFile, rm } from "node:fs/promises";

import { buildAll, buildCoverLetter, buildResume } from "./build";
import { resolveConfig } from "./config";
import { startDevServer } from "./dev-server";
import { exportPdf } from "./export-pdf";

type Action =
  | "build"
  | "build:cover-letter"
  | "build:resume"
  | "ci"
  | "dev"
  | "pdf"
  | "pdf:cover-letter"
  | "serve"
  | "stop"
  | "watch";

async function findPidByPort(port: number): Promise<number | null> {
  const proc = Bun.spawn(["lsof", "-ti", `tcp:${port}`], {
    stderr: "ignore",
    stdout: "pipe",
  });
  const output = await new Response(proc.stdout).text();
  const pid = Number.parseInt(output.trim().split("\n")[0] ?? "", 10);

  return Number.isFinite(pid) ? pid : null;
}

async function stopServer(): Promise<void> {
  const config = resolveConfig();
  const pidText = await readFile(config.serverPidPath, "utf8").catch(() => "");
  const pidFromFile = Number.parseInt(pidText.trim(), 10);
  const pid = Number.isFinite(pidFromFile) ? pidFromFile : await findPidByPort(config.port);

  if (!Number.isFinite(pid)) {
    console.log("No running resume server found.");
    await rm(config.serverPidPath, { force: true });
    return;
  }

  try {
    process.kill(pid, "SIGTERM");
    console.log(`Stopped resume server (${pid}).`);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code === "ESRCH") {
      console.log("Resume server was not running. Removed stale pid file.");
    } else {
      throw error;
    }
  }

  await rm(config.serverPidPath, { force: true });
}

function coverLetterPdfConfig(config: ReturnType<typeof resolveConfig>) {
  return {
    ...config,
    outputHtml: config.outputLetterHtml,
    outputPdf: config.outputLetterPdf,
  };
}

async function run(action: Action, config: ReturnType<typeof resolveConfig> = resolveConfig()): Promise<void> {
  const actions: Record<Action, () => Promise<void>> = {
    build: () => buildAll(config),
    "build:cover-letter": () => buildCoverLetter(config),
    "build:resume": () => buildResume(config),
    ci: async () => {
      await buildResume(config);
      await exportPdf(config);
      await buildCoverLetter(config);
      await exportPdf(coverLetterPdfConfig(config));
    },
    dev: () => startDevServer("watch", config),
    pdf: async () => {
      await buildResume(config);
      await exportPdf(config);
    },
    "pdf:cover-letter": async () => {
      await buildCoverLetter(config);
      await exportPdf(coverLetterPdfConfig(config));
    },
    serve: () => startDevServer("serve", config),
    stop: () => stopServer(),
    watch: () => actions.dev(),
  };

  await actions[action]();
}

if (import.meta.main) {
  const action = (Bun.argv[2] ?? "build") as Action;
  await run(action);
}

export { run };
