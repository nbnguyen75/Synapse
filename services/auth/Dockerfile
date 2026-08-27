FROM oven/bun:1.4-slim AS base
WORKDIR /app
COPY package.json bun.lock tsconfig.json ./

FROM base AS deps-prod
RUN --mount=type=cache,target=/root/.bun/install/cache \
  bun install --frozen-lockfile --production --ignore-scripts

FROM base AS deps-full
RUN --mount=type=cache,target=/root/.bun/install/cache \
  bun install --frozen-lockfile --ignore-scripts

FROM base AS app
ENV NODE_ENV=production
ENV IDLE_TIMEOUT=15
ENV PORT=5001

COPY --from=deps-prod /app/node_modules ./node_modules
COPY src ./src

USER bun
EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:5001/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "run", "src/index.ts"]

FROM base AS migrate
COPY --from=deps-full /app/node_modules ./node_modules
COPY src ./src
COPY drizzle ./drizzle
COPY drizzle.config.ts ./
COPY seed ./seed

USER bun
CMD ["bun", "run", "db:push"]