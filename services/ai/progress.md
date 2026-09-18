# Session Progress Log

## Current State

**Last Updated:** YYYY-MM-DD HH:MM
**Session ID:** [optional]
**Active Feature:** [feat-XXX - Feature Name]

## Status

### What's Done

- [x] [Completed item 1]
- [x] [Completed item 2]

### What's In Progress

- [ ] [Current work item]
   - Details: [specific task]
   - Blockers: [if any]

### What's Next

1. [Next action item]
2. [Following action item]

## Blockers / Risks

- [ ] [Blocker 1]: [description, impact]
- [ ] [Risk 1]: [description, mitigation]

## Decisions Made

- **[Decision 1]**: [description]
   - Context: [why this decision was made]
   - Alternatives considered: [what else was discussed]

## Files Modified This Session

- `path/to/file1.ts` - [brief description of change]
- `path/to/file2.ts` - [brief description of change]

## Evidence of Completion

- [ ] Tests pass: `[command and output]`
- [ ] Type check clean: `[command and output]`
- [ ] Manual verification: `[what was tested]`

## Notes for Next Session

- **Plan 001 DONE (2026-09-18, against commit 366d8bf)**: Switched `services/ai`
  from Vertex AI (`@ai-sdk/google-vertex` + service-account JWT) to AI Studio
  (`@ai-sdk/google`) with a (key x model) matrix router.
   - New `src/providers/router.ts`: per-task model chains (chat/generation/embed),
     round-robin over `GOOGLE_GENERATIVE_AI_API_KEYS`, per-(key, model) cooldown
     bans on 429/403 (`reportRateLimit`), earliest-expiring de-ban as deadlock
     breaker. `pick(task)` returns `{ provider, modelId, reportRateLimit }`.
   - `src/providers/ai-studio.ts` = thin wrappers `getChatModel()` /
     `getTitleModel()` / `getEmbeddingModel()` (explicit return types via
     `ReturnType<GoogleGenerativeAIProvider>`). `agent-platform.ts` deleted.
   - Embeddings repick a fresh (key, model) per `withRetry` attempt and report
     back to the router; `withRetry` now also backs off on 403 (was 429 only).
   - Env: removed all `GOOGLE_VERTEX_*`, `GOOGLE_CLIENT_EMAIL`,
     `GOOGLE_PRIVATE_KEY`; added required `GOOGLE_GENERATIVE_AI_API_KEYS`
     (comma-string) and optional `GOOGLE_GENERATIVE_AI_COOLDOWN_MS` (default
     60000). `.env.docker` gained a `GOOGLE_GENERATIVE_AI_API_KEYS=` line to fill
     locally. Deploy workflow now injects `secrets.AI_GOOGLE_GENERATIVE_AI_API_KEYS`.
   - Demo key count: **3 keys** recommended, 2 is the floor.
   - Verification: `bun --bun typecheck` exit 0; `bun --bun lint` exit 0 (0
     warnings); `bun --bun test src/providers/router.test.ts` -> 2 pass (chain
     advance + de-ban); boot smoke `/health` -> 200; `rg` for vertex/dead vars
     -> no matches; `google-vertex` gone from package.json/bun.lock.
   - Manual ops pending: create repo secret `AI_GOOGLE_GENERATIVE_AI_API_KEYS`,
     delete the 4 old Vertex/email secrets, fill `.env.docker`/`.env.example`
     with real keys.
   - Notes: `reportRateLimit` is quota-only (429/403); invalid-key 400/401 does
     not ban. Streaming chat swaps on the next turn (modelId metadata records
     the actual model). `noUncheckedIndexedAccess` is NOT in tsconfig despite
     `.agents/rules/typescript.md` claiming it — router code assumes guarded
     bounds only.
