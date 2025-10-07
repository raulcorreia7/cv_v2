import { execSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'output');
const templatePath = path.join(projectRoot, 'src', 'template', 'resume.json');
const outputJson = path.join(outputDir, 'resume.json');
const macchiatoTheme = 'jsonresume-theme-macchiato';
const sleekThemePath = path.join(projectRoot, 'src', 'theme', 'sleek', 'index.js');

const sleekVariants = [
  'noctilux',
  'aurora',
  'velvet',
  'obsidian',
  'ember',
  'solstice',
  'glacier',
  'sage',
  'cobalt',
  'lumen',
];

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

const run = (command) => {
  execSync(command, { stdio: 'inherit', cwd: projectRoot });
};

console.log('Converting template to resume.json...');
run(`npx hackmyresume convert "${templatePath}" "${outputJson}"`);

const builds = [
  {
    name: 'macchiato',
    command: `npx resumed "${outputJson}" --theme "${macchiatoTheme}" -o "${path.join(outputDir, 'resume-macchiato.html')}"`,
  },
  {
    name: 'sleek',
    command: `npx resumed "${outputJson}" --theme "${sleekThemePath}" -o "${path.join(outputDir, 'resume-sleek.html')}"`,
  },
  ...sleekVariants.map((variant) => ({
    name: `sleek-${variant}`,
    command: `npx resumed "${outputJson}" --theme "${sleekThemePath}" --theme-options.variant "${variant}" -o "${path.join(outputDir, `resume-${variant}.html`)}"`,
  })),
];

for (const { name, command } of builds) {
  console.log(`Building ${name} theme...`);
  run(command);
}

console.log('All themes built successfully.');
