import type { CoverLetterData } from "./types";

export const coverLetter = {
  schemaVersion: 1,
  title: "Raúl Correia, Cover Letter",
  name: "Raúl Correia",
  label: "Lead Backend Engineer",
  contact: [
    { text: "raulcorreia7@gmail.com", url: "mailto:raulcorreia7@gmail.com" },
    { text: "(+31) 627253238" },
    { text: "Almere, Netherlands" },
    { text: "linkedin.com/in/raul-correia", url: "https://www.linkedin.com/in/raul-correia" },
  ],
  greeting: "Dear Hiring Team,",
  paragraphs: [
    "I am a lead backend engineer in the Netherlands with seven years in software engineering. I turn unclear requirements into cloud services and APIs that teams can run and own.",
    "At Shell Recharge, I led a five-person team and backend services handling 100k to 1M requests a day. I owned API design and delivery, improved observability, and set shared TypeScript and AWS engineering patterns.",
    "At Forbion, I mapped and modernized a five-year-old Dataverse fund platform, built its CI/CD and IaC foundations, and aligned its governance with internal audit requirements. I also work with the AI researcher to build internal tools and agents, and I document the baselines used by engineers and external consultants.",
    "My main stack is TypeScript, Node.js, and AWS, with production experience in C#/.NET, Python, Azure, and Go. I am looking for a team that values backend engineering, clear system design, and ownership from requirements through production.",
    "I would welcome the chance to discuss how I could contribute to your team.",
  ],
  closing: "Kind regards,",
} satisfies CoverLetterData;
