FROM oven/bun:latest AS app
WORKDIR /app
COPY package.json bun.lock tsconfig.json ./
RUN bun install --frozen-lockfile --production --ignore-scripts
COPY src ./src
EXPOSE 5001
CMD ["bun", "--bun", "run", "src/app.ts"]

FROM oven/bun:latest AS migrate
WORKDIR /app
COPY package.json bun.lock tsconfig.json ./
RUN bun install --frozen-lockfile --ignore-scripts
COPY src ./src
COPY drizzle ./drizzle
COPY drizzle.config.ts ./
CMD ["bun", "--bun", "db:push"]