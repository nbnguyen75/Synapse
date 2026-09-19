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

- **Plan 002 DONE (2026-09-18, working tree): src/** refactor executed** —
  17 files, net −33 lines, behavior-preserving. Verification: `bun --bun
 typecheck` 0 errors, `bun --bun lint` 0 errors/0 warnings,
  `bun --bun test src/providers/router.test.ts` 2 pass,
  boot smoke `/health` → `{"status":"ok"}` (dummy API key, port 18099).
  - `conversation/repository.ts`: no longer imports `UIMessage`; new exported
    `NewMessageValues` (DB-insert-derived); `extractPlainTextFromParts` moved
    to services; `insertMessage`/`insertMessagesBulk` take shaped values, zero
    casts. `conversation/services.ts`: manual `MessageRow` → derived
    `Awaited<ReturnType<typeof findMessagesByConversationId>>[number]`;
    `getOrCreateConversation` delegates to `checkConversationOwnership`;
    dead `loadHistory` deleted (+ index export); clone preserves
    `searchText` pass-through, keeps `idMap.set` remap.
  - `chat/repository.ts`: pure DB — `searchNotesHybrid` split into
    `searchNotesByFts` + `searchNotesByRrf(embedding)` + exported
    `getRecentNotes`; dead `SimilarNote` deleted. Orchestration lives in new
    `chat/notes.ts:searchUserNotes` (cycle-free; tools→services import would
    have cycled). `chat/services.ts` 300→~150 lines: prompt → `chat/prompt.ts`,
    message helpers → `chat/messages.ts`; route imports updated.
  - Facets explicit: `generator/index`, `embeddings/index`,
    `chat/tools/index`. Dead `UnauthorizedError`/`ConflictError`,
    `RAG_TOP_K`/`RAG_SIMILARITY_THRESHOLD` deleted. `validation.ts` message
    fixed; `auth.ts` guards missing `sub`. `findMessageById` re-exported via
    `@/conversation` facade (route no longer reaches into repository).
  - Kept deliberately: mount paths, `route.ts` filenames, explicit return
    types, raw-SQL row types, JWT/pubsub/role-enum/gratitude strings.
  - Full read-only audit evidence from plan time retained below.
  - Intent: behavior-preserving cleanup per the Backend Refactoring &
    Optimization Playbook. Next session's executor applies the plan in the
    `services/ai` working tree, then flips the status row in
    `plans/README.md` to DONE and records verification evidence here.
  - **Put on the record (data push, not yet a code change):**
    - `src/conversation/repository.ts` imports `type { UIMessage } from 'ai'`
      (line 1); `insertMessage` (lines 88-97) / `insertMessagesBulk`
      (lines 139-147) take UI-shaped messages and cast `parts`
      (`as UIMessage['parts']`, line 89), `role` (`as UIMessage['role']`,
      line 142), `metadata` (`as MessageMetadata | null`, line 89).
      `extractPlainTextFromParts` (lines 71-79) sits inside the repository
      (preparation logic in the wrong layer).
    - `src/conversation/services.ts` — manual `MessageRow` interface
      (lines 24-34), `toUIMessage` casts `parts as UIMessage['parts']` +
      `role as UIMessage['role']` (lines 36-44); `cloneConversation` casts
      `parts` again at line 186; dead export `loadHistory` (line 98;
      `conversation/index.ts:5`).
    - `src/chat/repository.ts` — `searchNotesHybrid` (lines 68-177) owns
      Tier1 FTS / Tier2 RRF orchestration + calls `embedText` (AI provider)
      inside the repository; dead `SimilarNote` type (line 7); dead raw-FTS
      constants `RAG_TOP_K` / `RAG_SIMILARITY_THRESHOLD` in
      `src/chat/constants.ts:1-2`.
    - `export *` facets — `src/generator/index.ts:2` (`./constants`),
      `src/embeddings/index.ts:2` (`./constants`),
      `src/chat/tools/index.ts:1-2` (both). Wait, `src/chat/tools/index.ts`
      currently does `export * from './notes';` + `export * from './chat';`
      (per grep of `plans/001` content) — the executor must read the live
      file to confirm, drift-checked in the plan.
    - Dead symbols to delete — `src/lib/errors.ts:25` `UnauthorizedError`,
      `:48` `ConflictError` (never constructed);
      `src/middleware/validation.ts:23` copy-pasted "The database is playing
      hide and seek right now." message.
    - Boundary / kept (NOT touched): raw SQL row types (`SearchNoteItem`,
      `SimilarNote`-style `extends Record<string, unknown>`), JWT
      `payload.sub as string` (auth.ts:28), pubsub ack semantics
      (`pubsub.route.ts`), DB role enum (`roleEnum`), gratitude strings.
  - **Decision (operator-confirmed)**: keep mount paths (`/chat`,
    `/conversations`, `/settings`, `/generator`, `/pubsub`) and singular
    `route.ts` filenames — changing them breaks the cross-service API
    contract in `feature_list.json`. Renaming to `routes.ts` and adding an
    `/api/v1/<feature>` tree is deliberately out of scope (vanity churn +
    contract risk).
  - **Verification** (to be run live by the 002 executor): `bun --bun
typecheck`, `bun --bun lint`, `bun --bun test src/providers/router.test.ts`
    (2 tests pass), boot smoke `/health` -> 200.

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
