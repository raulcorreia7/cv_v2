import { watch } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { build } from "./build";
import { resolveConfig, type BuildConfig } from "./config";

const encoder = new TextEncoder();
const LIVE_RELOAD_PATH = "/__resume_live_reload";

function injectLiveReload(html: string): string {
  const snippet = `<script>
(() => {
  const source = new EventSource("${LIVE_RELOAD_PATH}");
  source.onmessage = (event) => {
    if (event.data === "reload") {
      window.location.reload();
    }
  };
})();
</script>`;

  return html.includes("</body>") ? html.replace("</body>", `${snippet}\n</body>`) : `${html}\n${snippet}`;
}

function resolveRequestPath(config: BuildConfig, requestPath: string): string {
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const relativePath = decodeURIComponent(normalizedPath).replace(/^\/+/, "");
  const fullPath = path.resolve(config.outputDir, relativePath);

  if (!fullPath.startsWith(path.resolve(config.outputDir))) {
    return path.resolve(config.outputDir, "index.html");
  }

  return fullPath;
}

async function writePidFile(config: BuildConfig): Promise<void> {
  await mkdir(config.outputDir, { recursive: true });
  await writeFile(config.serverPidPath, `${process.pid}\n`, "utf8");
}

async function removePidFile(config: BuildConfig): Promise<void> {
  await rm(config.serverPidPath, { force: true });
}

export async function startDevServer(mode: "serve" | "watch", config: BuildConfig = resolveConfig()): Promise<void> {
  await build(config);

  const clients = new Set<ReadableStreamDefaultController<Uint8Array>>();
  let rebuildTimer: ReturnType<typeof setTimeout> | undefined;
  let building = false;
  let queued = false;

  const broadcastReload = (): void => {
    for (const client of clients) {
      client.enqueue(encoder.encode("data: reload\n\n"));
    }
  };

  const rebuild = async (): Promise<void> => {
    if (building) {
      queued = true;
      return;
    }

    building = true;

    try {
      await build(config);
      broadcastReload();
    } catch (error) {
      console.error(error);
    } finally {
      building = false;

      if (queued) {
        queued = false;
        await rebuild();
      }
    }
  };

  if (mode === "watch") {
    const watchedPaths = [config.templateDir, config.assetsDir, path.resolve("scripts")];

    for (const watchedPath of watchedPaths) {
      watch(watchedPath, () => {
        clearTimeout(rebuildTimer);
        rebuildTimer = setTimeout(() => {
          void rebuild();
        }, 150);
      });
    }
  }

  const server = Bun.serve({
    port: config.port,
    async fetch(request) {
      const url = new URL(request.url);

      if (url.pathname === LIVE_RELOAD_PATH) {
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            clients.add(controller);
            controller.enqueue(encoder.encode("retry: 1000\n\n"));
            request.signal.addEventListener(
              "abort",
              () => {
                clients.delete(controller);
                controller.close();
              },
              { once: true },
            );
          },
        });

        return new Response(stream, {
          headers: {
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Content-Type": "text/event-stream",
          },
        });
      }

      const filePath = resolveRequestPath(config, url.pathname);
      const file = Bun.file(filePath);

      if (!(await file.exists())) {
        return new Response("Not found", { status: 404 });
      }

      if (file.type === "text/html;charset=utf-8" || filePath.endsWith(".html")) {
        return new Response(injectLiveReload(await file.text()), {
          headers: {
            "Cache-Control": "no-cache",
            "Content-Type": "text/html; charset=utf-8",
          },
        });
      }

      return new Response(file, {
        headers: {
          "Cache-Control": "no-cache",
          "Content-Type": file.type || "application/octet-stream",
        },
      });
    },
  });

  await writePidFile(config);

  const shutdown = async (): Promise<void> => {
    await removePidFile(config);
    server.stop(true);
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown();
  });

  process.on("SIGTERM", () => {
    void shutdown();
  });

  console.log(`Serving ${config.outputDir} at ${server.url}`);
}
