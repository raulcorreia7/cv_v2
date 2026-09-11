FROM oven/bun:1.3.11 AS base

WORKDIR /app

COPY package.json bun.lock ./
COPY scripts ./scripts
COPY src ./src

RUN bun install --frozen-lockfile \
  && bunx playwright install --with-deps chromium

# Assemble the publishable site from the source documents
FROM base AS site

RUN bun scripts/build-site.ts

FROM nginx:alpine AS runtime

COPY --from=site /app/output/ /usr/share/nginx/html/

EXPOSE 80
