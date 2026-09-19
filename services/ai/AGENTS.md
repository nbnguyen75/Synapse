# AGENTS.md — Synapse AI Service (`services/ai`)

Project: **Synapse AI Service (`services/ai`)**. Stack: Hono (TypeScript) + Bun + PostgreSQL (pgvector via Drizzle ORM) + Vercel AI SDK (Google Generative AI / Vertex AI) + Jose (JWT / JWKS Auth).

Description: AI-native personal knowledge assistant with RAG-powered note chat, embedding generation via Pub/Sub, conversational assistance, and agentic tools.

This file follows the standard `AGENTS.md` convention — any coding agent working here must follow these instructions.

## Boundaries & Architecture

- **Service Authority**: This service owns AI features (RAG retrieval, embeddings, chat generation, conversational history, AI settings, and AI agent tools) for Synapse.
- **Authentication**: JWT verification via remote JWKS (`jose` with `AUTH_JWKS_URL`), resolving authenticated `userId`.
- **Database & Persistence**: PostgreSQL with `pgvector` via Drizzle ORM (`drizzle-orm`, `drizzle-kit`).
- **AI & LLM Integration**: Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/google-vertex`) with Tavily search tools.
- **Service Modular Monolith Architecture**: Organized by domain modules under `src/` (e.g. `src/chat`, `src/conversation`, `src/embeddings`, `src/generator`, `src/settings`, `src/database`, `src/middleware`, `src/providers`).
  - Submodules expose public symbols via submodule `index.ts`.
  - Layer separation within modules: `route.ts` (HTTP transport & Zod validation) -> `services.ts` (business & AI orchestration) -> `repository.ts` (Drizzle queries).
- **Coding & Type Rules**: Strict rules are enforced in `.agents/rules/typescript.md` (English only, Zod v4 `zod/v4`, strict non-relative imports `@/...`, functional architecture, zero-`any`, no synthetic test bypasses).

## Folder Architecture

```
src/
  app.ts                 # Hono app instance, global middleware, route mounting
  index.ts               # Server entry point (Bun fetch handler & port configuration)
  chat/                  # AI chat assistant, streaming, tool-calling (e.g. note retrieval)
  conversation/          # Conversation sessions, message branching, and metadata persistence
  embeddings/            # Text vectorization & Pub/Sub note embedding ingestion
  generator/             # Title and summary generation utilities
  settings/              # User AI personality presets & customization preferences
  database/              # Drizzle ORM client, schemas (tables, vector extensions, enums)
  providers/             # AI model providers (Google Gemini / Vertex AI)
  middleware/            # Hono middlewares (JWKS auth guard, error handler, validation)
  config/                # Validated environment configuration (@t3-oss/env-core & Zod)
  lib/                   # Shared errors, utils, and helpers
  types/                 # Shared types and response contracts
```

## Workflow, Tracking & File Management

1. **Feature & Task Tracking**:
   - `feature_list.json`: Reserved strictly for major **Product Features** and cross-service API contracts.
   - `plans/*.md`: Used for technical execution, refactoring, bug fixes, and optimizations.
2. **Execution & Documentation Cadence**:
   - Run `./init.sh` at session start.
   - When executing multiple plans in a session, update `plans/README.md` status rows progressively, and write a single consolidated **Batch Summary** to `progress.md` at the end of the session.
3. **Long-term Archiving**:
   - **Numeric Range Buckets**: Group completed plans into fixed buckets of 20–30 plans (`plans/archive/000-020/`, `plans/archive/021-050/`, etc.).
   - **Eligibility**: Only archive plans that have reached 100% `DONE` (verified against Definition of Done) or `REJECTED`/`SUPERSEDED`. Never move `TODO` or `IN PROGRESS` plans to archive.
   - **Trigger**: Run `bun run archive:plans` when root `plans/` exceeds 20–30 files or when a numeric batch finishes.
   - **Global Monotonic Numbering**: The `improve` skill must scan both root `plans/` AND `plans/archive/*/` to determine the next plan number (`MAX(id) + 1`). Never reset plan numbers when root is empty.
   - **Link Integrity & Master Log**: Maintain batch summaries in `plans/archive/README.md`. Keep `plans/README.md` lean with an Archived Batches reference table and the active batch only, preventing broken relative links.
   - Archive old session logs from `progress.md` to `docs/history/` to keep `progress.md` under 100KB (rolling log).

## Mandatory Skills & Skill Routing

- **Always Active (Mandatory)**:
  - **`improve`**: High-level architectural survey, structural integrity, and self-contained execution plans.
  - **`ponytail` / `ponytail-review`**: Implement simplest, minimal YAGNI solutions; eliminate bloat, wrapper objects, and dead abstractions.

| Task                                         | Skill                                    |
| -------------------------------------------- | ---------------------------------------- |
| Always Active (Simplicity & Architecture)    | `ponytail`, `improve`, `ponytail-review` |
| Backend refactoring, SRP, query optimization | `refactor`                               |
| Hono routing, validation, middleware         | `hono`                                   |
| Service architecture & boundaries            | `backend-architecture`                   |
| TDD & Automated API tests                    | `test-driven-development`                |
| Code review & quality checks                 | `code-review-and-quality`                |
| Debugging & Diagnostics                      | `diagnosing-bugs`                        |

## Definition of Done

A feature or plan is done only when:

- [ ] Target behavior matches specifications in `feature_list.json` or `plans/*.md`.
- [ ] Code strictly follows domain module boundaries (`route.ts`, `services.ts`, `repository.ts`, `schemas.ts`).
- [ ] Simplification verified with `ponytail` and `ponytail-review`.
- [ ] `bun --bun typecheck` exits 0.
- [ ] `bun --bun lint` exits 0.
- [ ] Evidence recorded in `progress.md` (and `feature_list.json` if a product feature).
