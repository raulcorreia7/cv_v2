FROM oven/bun:1.3.11 AS base

WORKDIR /app

COPY package.json bun.lock ./
COPY scripts ./scripts
COPY src ./src

RUN bun install --frozen-lockfile \
  && bunx playwright install --with-deps chromium

FROM base AS build

RUN bun scripts/run.ts ci

FROM base AS release

RUN OUTPUT_DIR=output bun scripts/run.ts ci

FROM base AS dev

EXPOSE 8080

CMD ["bun", "scripts/run.ts", "dev"]

FROM nginx:alpine AS runtime

COPY --from=release /app/output/ /usr/share/nginx/html/

EXPOSE 80
