FROM oven/bun:1.3.11-debian

RUN apt-get update \
  && apt-get install -y --no-install-recommends make \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

VOLUME ["/app/output", "/app/src"]

COPY package.json bun.lock ./
COPY Makefile ./
COPY scripts/ ./scripts/
COPY src/ ./src/

RUN bun install --frozen-lockfile \
  && bunx playwright install --with-deps chromium

CMD ["make", "run", "ACTION=ci"]
