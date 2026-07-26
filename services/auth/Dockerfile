FROM oven/bun:latest AS base
WORKDIR /app

# cài dependencies trước để tận dụng docker layer cache
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .

EXPOSE 5001
CMD ["bun", "run", "src/app.ts"]