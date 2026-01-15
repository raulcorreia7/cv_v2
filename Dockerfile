FROM surnet/alpine-node-wkhtmltopdf:22.22.0-0.12.6-small

RUN apk add --no-cache make

WORKDIR /app

VOLUME ["/app/output", "/app/src"]

COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
COPY Makefile ./
COPY scripts/ ./scripts/

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate && pnpm install --prod

CMD ["make", "all"]
