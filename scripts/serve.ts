import path from "node:path";

const root = path.resolve(process.cwd());
const port = Number(process.env.PORT ?? 8080);

Bun.serve({
  port,
  async fetch(request) {
    const requestPath = decodeURIComponent(new URL(request.url).pathname);
    const relative = requestPath.endsWith("/") ? `${requestPath}index.html` : requestPath;
    const filePath = path.resolve(root, `.${relative}`);

    if (!filePath.startsWith(root)) {
      return new Response("not found", { status: 404 });
    }

    const file = Bun.file(filePath);

    if (!(await file.exists())) {
      return new Response("not found", { status: 404 });
    }

    return new Response(file, { headers: { "content-type": file.type } });
  },
});

console.log(`Serving ${root} on http://localhost:${port}/`);
console.log(`Documents: /src/resume.html  /src/cover-letter.html  site: /output/`);
