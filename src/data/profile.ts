import type { ResumeData } from "./types";

export const basics = {
  name: "Raúl Correia",
  label: "Lead Backend Engineer",
  email: "raulcorreia7@gmail.com",
  phone: "(+31) 627253238",
  location: "Almere, Netherlands",
  github: "https://github.com/raulcorreia7",
  linkedin: "https://www.linkedin.com/in/raul-correia",
  photo: "src/assets/raul-circle-ai.jpg",
  summary:
    "Lead backend engineer with seven years in software engineering and more than ten years of professional experience. I lead teams and delivery, build cloud services and APIs, and set engineering standards for reliable systems.",
} satisfies ResumeData["basics"];

export const skills = [
  {
    name: "Cloud & DevOps",
    items: [
      "AWS",
      "Azure",
      "AWS Lambda",
      "DynamoDB",
      "API Gateway",
      "EventBridge",
      "SQS",
      "IAM",
      "CloudWatch",
      "SST",
      "Serverless Framework",
      "AWS CDK",
      "Terraform",
      "Docker",
      "GitLab CI",
      "Datadog",
      "HashiCorp Vault",
    ],
  },
  {
    name: "Programming Languages & Frameworks",
    items: ["TypeScript", "Node.js", "C#/.NET", "Go", "Python"],
  },
  {
    name: "Architecture & Practices",
    items: [
      "Behavior-Driven Development (BDD)",
      "Domain-Driven Design (DDD)",
      "Event-Driven Architecture",
      "Infrastructure as Code",
    ],
  },
] satisfies ResumeData["skills"];

export const languages = [
  { name: "Portuguese", level: "Native" },
  { name: "English", level: "Fluent" },
  { name: "Dutch", level: "A1.1" },
] satisfies ResumeData["languages"];

export const interests = [
  "Open source",
  "Artificial intelligence",
  "Computer science",
  "Reverse engineering",
  "Cycling",
  "Driving",
  "Competitive gaming",
  "Traveling",
  "Coffee",
  "Food",
] satisfies ResumeData["interests"];

export const education = [
  {
    institution: "Instituto Superior de Engenharia do Porto",
    start: "09/2016",
    end: "09/2019",
    qualification: "Bachelor's in Computer Engineering (Engenharia Informática)",
    grade: "16/20 - Cum laude (8/10 NL Equivalent)",
  },
] satisfies ResumeData["education"];

export const awards = [
  {
    name: "GameGune 2008 World Tournament (Counter-Strike 1.6)",
    date: "2008",
    awarder: "GameGune",
    summary: "Competed with Skilledamn! in Group B at the GameGune 2008 world tournament.",
  },
] satisfies ResumeData["awards"];
