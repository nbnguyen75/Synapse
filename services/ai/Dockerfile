FROM oven/bun:latest AS base
WORKDIR /app

# ==== Stage: app (production, chỉ chạy server) ====
FROM base AS app

COPY package.json bun.lock tsconfig.json ./

# Cache mount giúp bun install nhanh hơn ở các lần build sau (không cache vào layer)
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production --ignore-scripts

COPY src ./src

# Chạy bằng user không phải root — giảm rủi ro nếu container bị compromise
USER bun

EXPOSE 5002

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD bun -e "fetch('http://localhost:5002/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "run", "src/app.ts"]

# ==== Stage: migrate (job riêng, chạy 1 lần trước khi app start, cần đủ devDeps cho drizzle-kit) ====
FROM base AS migrate

COPY package.json bun.lock tsconfig.json ./

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --ignore-scripts

COPY src ./src
COPY drizzle ./drizzle
COPY drizzle.config.ts ./
COPY seed ./seed

CMD ["bun", "run", "db:push"]