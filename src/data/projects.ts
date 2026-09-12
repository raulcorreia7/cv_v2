import type { ProjectEntry } from "./types";

export const projects = [
  {
    name: "theme-browser.nvim",
    url: "https://github.com/raulcorreia7/theme-browser.nvim",
    start: "02/2026",
    end: "02/2026",
    role: "Author",
    summary:
      "Built an open source Neovim theme browser for previewing, installing, and applying themes. Added agent-based validation to reduce false positives; reached about 1,700 clones on its first day.",
    technologies: ["Lua", "Bun", "Neovim", "lazy.nvim", "AI agents"],
  },
  {
    name: "Lambda Component Testing Framework",
    url: "https://github.com/raulcorreia7/component-testing-framework",
    start: "06/2023",
    end: "08/2023",
    role: "Developer",
    summary: "Built a TypeScript framework that tests deployed AWS Lambda functions. Several Shell Recharge teams adopted it.",
    technologies: ["TypeScript", "Node.js", "AWS Lambda", "Testing", "Shell Recharge"],
  },
  {
    name: "Career Wrapped",
    url: "https://cw.raulcorreia.dev/r/raul-correia-t2572sry?jobId=48b1a2d7-479f-41ba-9b47-8896126c3721&view=result",
    start: "03/2026",
    end: "03/2026",
    role: "Hackathon Builder",
    summary:
      "Built an app at VEED.IO's AMS GenAI & Video hackathon that turns a public LinkedIn profile into a shareable career recap and optional MP4 using LLMs and image and video models.",
    technologies: ["TypeScript", "Bun", "Deno", "Cloudflare", "Supabase", "Runware.ai", "Multimodal AI"],
  },
  {
    name: "Codecrafters HTTP Server in Go",
    url: "https://github.com/raulcorreia7/codecrafters-http-server-go",
    role: "Developer",
    summary: "Built an HTTP server from scratch in Go for the Codecrafters challenge, implementing TCP and HTTP directly.",
    technologies: ["Go", "HTTP", "Networking", "Codecrafters"],
  },
  {
    name: "Movimento tech4COVID19 (Pro bono work)",
    start: "03/2020",
    end: "06/2020",
    role: "Backend Developer",
    summary:
      "Built a pharmacy priority queue that helped COVID-positive care homes order medicine during the national emergency. Worked on GDPR and interface clarity.",
    technologies: ["C#", ".NET", "AWS", "GDPR", "UI/UX"],
  },
] satisfies ProjectEntry[];
