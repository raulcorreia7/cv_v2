export type DatedEntry = {
  start?: string;
  end?: string;
};

export type WorkEntry = DatedEntry & {
  company: string;
  url: string;
  duration?: string;
  role: string;
  summary: string;
  technologies?: string[];
  highlights: string[];
  page: "main" | "more";
};

export type ProjectEntry = DatedEntry & {
  name: string;
  url?: string;
  role: string;
  summary: string;
  technologies: string[];
};

export type ResumeData = {
  schemaVersion: 1;
  basics: {
    name: string;
    label: string;
    email: string;
    phone: string;
    location: string;
    github: string;
    linkedin: string;
    photo: string;
    summary: string;
  };
  work: WorkEntry[];
  skills: Array<{ name: string; items: string[] }>;
  languages: Array<{ name: string; level: string }>;
  interests: string[];
  projects: ProjectEntry[];
  education: Array<DatedEntry & { institution: string; qualification: string; grade: string }>;
  awards: Array<{ name: string; date: string; awarder: string; summary: string }>;
};

export type CoverLetterData = {
  schemaVersion: 1;
  title: string;
  name: string;
  label: string;
  contact: Array<{ text: string; url?: string }>;
  greeting: string;
  paragraphs: string[];
  closing: string;
};
