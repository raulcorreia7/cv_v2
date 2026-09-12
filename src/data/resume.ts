import { projects } from "./projects";
import { awards, basics, education, interests, languages, skills } from "./profile";
import type { ResumeData } from "./types";
import { work } from "./work";

export const resume = {
  schemaVersion: 1,
  basics,
  work,
  skills,
  languages,
  interests,
  projects,
  education,
  awards,
} satisfies ResumeData;
