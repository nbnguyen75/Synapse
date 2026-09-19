# Plan 002: Refactor src/** per the Backend Refactoring & Optimization Playbook

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` and record evidence in `progress.md`.
>
> **Drift check (run first)**: `git diff --stat HEAD -- src/`
> If any file listed under "Current state" differs from the excerpts in this
> plan, compare against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.
>
> **Line-number baseline**: this plan's "Current state" excerpts cite line
> numbers against `git resolve-conflicts` + `git status` output from
> **2026-09-18 session 2**, which plan 001 fully merged + verified (DONE).

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: refactor
- **Planned at**: 2026-09-18 (session 2, after plan 001)
- **Status row in `plans/README.md`**: IN PROGRESS

## Why this matters

The `src/**` tree has drifted from the architecture the playbook mandates.
Nothing is broken, but four structural smells make every future change cost
more: (1) the AI SDK type `UIMessage` has leaked into the data layer; (2)
manual DTOs (`MessageRow`, the repository insert casts) duplicate types the
compiler already derives; (3) `export *` facets leak constant surfaces into
unrelated modules; (4) dead code (unused error classes, `loadHistory`,
unreferenced constants) persists because no one grep'd it. This is a
mechanical, behavior-preserving cleanup.

## Current state (verified at plan time)

- `src/conversation/repository.ts` imports `type { UIMessage } from 'ai'`
  (line 8). `insertMessage` (lines 88-97) takes a `UIMessage` and casts
  `parts` (jsonb → `UIMessage['parts']`, line 89) and `metadata`
  (`as MessageMetadata | null`). `insertMessagesBulk` (lines 139-147) casts
  `role: row.role as UIMessage['role']` (line 142).
- `src/conversation/services.ts` defines a manual `MessageRow` interface
  (lines 24-34) + `toUIMessage` mapper (lines 36-44) that casts
  `parts as UIMessage['parts']` and `role as UIMessage['role']`.
  `cloneConversation` casts `parts` again at line 186. Ownership is
  duplicated: `getOrCreateConversation` (lines 46-60) and
  `checkConversationOwnership` (lines 62-73) each do
  find + NotFoundError + ForbiddenError. `loadHistory` (line 98) is exported
  by `conversation/index.ts:5` but imported nowhere (dead).
- `src/chat/repository.ts` — `searchNotesHybrid` (lines 68-177) calls
  `embedText` (an AI provider call) and owns the Tier1 FTS / Tier2 RRF
  orchestration. The DB role enum (`schema.ts:27`) is
  `['user', 'assistant', 'system', 'data', 'tool']` — identical value-for-value
  to the AI SDK `UIMessage['role']` union, so those casts are unnecessary once
  the type flows through instead of through `string`.
- `src/chat/services.ts` is 300 lines, mixing prompts (`buildSystemPrompt`,
  `getResponseLengthInstruction`), message shaping (`cleanPartsForStorage`,
  `sanitizeMessages`, `extractQuestionText`, `validateChatMessages`) and
  streaming (`createChatStreamResponse`, `prepareChatTurn`,
  `saveAssistantReply`, `getChatTools`).
- `src/chat/constants.ts` — `RAG_TOP_K` (line 1) and
  `RAG_SIMILARITY_THRESHOLD` (line 2) — referenced nowhere.
- Facets with `export *`: `src/generator/index.ts`,
  `src/embeddings/index.ts`, `src/chat/tools/index.ts`.
- `src/middleware/validation.ts:23` — zValidator failure message is the
  copy-pasted "The database is playing hide and seek right now." (should be a
  validation message).
- `src/middleware/auth.ts:28` — `c.set('userId', payload.sub as string)`
  assert-casts an optional field (`sub` is optional in JWTPayload).

## Out of scope (deliberately skipped)

- **Mount paths** (`/chat`, `/conversations`, `/settings`, `/generator`,
  `/pubsub`) and route file names (`route.ts`, singular, `export default`).
  Per operator decision: **keep paths and names** — changing them breaks the
  cross-service API contract recorded in `feature_list.json` / `app.ts` mounts.
- **Repository / service explicit return types**: keep them. The repo's
  `.agents/rules/typescript.md` requires explicit return types on exported
  functions and forbids `as` casts; where the playbook says "derive types via
  `Awaited<ReturnType<...>>`", keep the derived-type approach for the _manual
  DTOs_ specifically, but do NOT strip existing explicit return annotations.
- **Boundary casts** (raw `db.execute` SQL rows, `SearchNoteItem extends
Record<string, unknown>`, JWT `payload.sub`, `p.text as string` in tools)
  — intentional trust-boundary casts, kept.
- `pubsub.route.ts` (deliberately returns c.text + skips errorHandler for
  Pub/Sub ack semantics), database/, types/, providers/, settings/,
  embeddings/services.ts, generator/services.ts.

## Commands you will need

| Purpose              | Command                                       | Expected on success   |
| -------------------- | --------------------------------------------- | --------------------- |
| Typecheck            | `bun --bun typecheck`                         | exit 0, no errors     |
| Lint                 | `bun --bun lint`                              | exit 0                |
| Format changed files | `bunx prettier --write <files>`               | exit 0                |
| Router regression    | `bun --bun test src/providers/router.test.ts` | 2 tests pass          |
| Dead-symbol scan     | `rg "UIMessage" src/conversation`             | repository only: none |
| `export *` scan      | `rg "export \*" src/`                         | no matches            |

## Steps

### Step 1: `src/lib/errors.ts` — delete dead subclasses

Remove `UnauthorizedError` (lines 25-29) and `ConflictError` (lines 48-52).
Keep `AppError`, `NotFoundError`, `ForbiddenError`, `ValidationError`.

**Verify**: `bun --bun typecheck` -> exit 0; `rg "UnauthorizedError|ConflictError" src/` -> no matches.

### Step 2: `src/conversation/repository.ts` — drop the `UIMessage` import

The repository should accept plain, DB-shaped inputs and return plain rows —
no UI types, no casts.

1. Export a derived row type near the top:
   `export type MessageRow = Awaited<ReturnType<typeof findMessagesByConversationId>>[number];`
2. Move `extractPlainTextFromParts` (lines 71-79) — content->searchText shaping
   is preparation logic; it leaves the repository and lands in
   `src/chat/messages.ts` (Step 5) as `extractPlainTextFromParts`.
3. Define one insert param type:
   ```ts
   export type NewMessageInput = {
     id: string;
     parentId: string | null;
     role: MessageRow['role'];
     parts: MessageRow['parts'];
     metadata: MessageRow['metadata'];
     searchText: string;
     createdAt?: Date;
   };
   ```
4. Rewrite `insertMessage(conversationId, message: UIMessage, parentId?)`
   -> `insertMessage(conversationId: string, input: NewMessageInput)`. It
   inserts `input` verbatim (no cast, no shaping).
5. Rewrite `insertMessagesBulk(conversationId, rows: Array<NewMessageInput>)`.
   Drop the `role as UIMessage['role']` cast (line 142) — the enum already
   equals `UIMessage['role']`. Drop the `message.role as UIMessage['role']`
   cast (line 150 / `insertMessage`).

**Verify**: `rg "UIMessage" src/conversation/repository.ts` -> no matches; `bun --bun typecheck` -> exit 0.

### Step 3: `src/conversation/services.ts` — remove manual DTO, DRY ownership, delete dead export

1. Delete `interface MessageRow` (lines 24-34); import the derived type from
   the repository instead: `import type { MessageRow } from '@/conversation/repository';`.
2. In `toUIMessage`, drop the `as UIMessage['role']` cast (role enum is
   already `UIMessage['role']` structurally) and the `as UIMessage['parts']`
   cast if the type flows through (boundary cast only if still required for
   `parts` jsonb -> `UIMessage['parts']`).
3. Extract a private `getOwnedConversation(userId, conversationId)` that
   does find + NotFoundError + ForbiddenError; use it in both
   `checkConversationOwnership` and the conversation-ownership branch of
   `getOrCreateConversation`.
4. Delete `loadHistory` (line 98) and its export in `conversation/index.ts:5`.

**Verify**: `bun --bun typecheck` -> exit 0; `rg "loadHistory" src/` -> no matches.

### Step 4: `src/chat/repository.ts` — repository is DB-only again

Move `searchNotesHybrid` orchestration out; repository keeps pure queries.

1. Delete `searchNotesHybrid` (lines 68-177) and the `embedText` import.
2. Expose the two pure queries + fallback as exports:
   - `searchNotesByFts(userId, trimmedQuery, limit)` — Tier 1 raw SQL.
   - `searchNotesByRrf(userId, trimmedQuery, embedding, limit)` — Tier 2 CTE
     (embedding passed in, not computed here).
   - `getRecentNotes(userId, limit)` — export the existing private fn
     (keep `SearchNoteItem`; it is run-time row typing for `db.execute`).
3. New `src/chat/services.ts` gains `searchNotesHybrid` (same shape): trim
   query -> empty returns `getRecentNotes`; Tier1 FTS; if rows >= limit return
   (mapping `updatedAt` to `Date`); else `embedText` -> Tier2 RRF -> fallback
   `getRecentNotes`. Imports `embedText` from `@/lib/ai`.
4. `src/chat/tools/notes.ts` imports `searchNotesHybrid` from `@/chat/services`
   instead of `@/chat/repository`.

**Verify**: `rg "embedText|searchNotesHybrid" src/chat/repository.ts` -> no matches; `bun --bun typecheck` -> exit 0.

### Step 5: split `src/chat/services.ts` into prompt + message modules

- New **`src/chat/prompt.ts`**: move `buildSystemPrompt` and
  `getResponseLengthInstruction`. Import `type UserAiSettings` from `@/settings`
  and `type MessageMetadata` from `@/database/schema`.
- New **`src/chat/messages.ts`**: move `cleanPartsForStorage`,
  `sanitizeMessages`, `extractQuestionText`, `validateChatMessages`, and
  (from Step 2) `extractPlainTextFromParts`. Import `dataPartSchema,
messageMetadataSchema` from `@/chat/schemas`.
- `src/chat/services.ts` keeps: `createChatStreamResponse`, `prepareChatTurn`,
  `saveAssistantReply`, `getChatTools`, and (from Step 4) `searchNotesHybrid`.
  Update imports to pull prompt/message helpers from the two new files.
- `src/chat/route.ts`: change the import of `extractQuestionText` /
  `validateChatMessages` from `@/chat/services` to `@/chat/messages` (keep
  `createChatStreamResponse`, `prepareChatTurn` from `@/chat/services`).

**Verify**: `bun --bun typecheck` -> exit 0; `rg "buildSystemPrompt" src/chat/route.ts src/chat/services.ts` -> imports from `@/chat/prompt` and `@/chat/services`.

### Step 6: constants — delete dead RAG vars + fix validation message

1. `src/chat/constants.ts`: delete `RAG_TOP_K` and `RAG_SIMILARITY_THRESHOLD`.
2. `src/middleware/validation.ts:23`: replace the failure message with
   `'The request payload failed validation.'` (remove the copy-pasted DB
   message).

**Verify**: `rg "RAG_TOP_K|RAG_SIMILARITY_THRESHOLD" src/` -> no matches; `bun --bun typecheck` -> exit 0.

### Step 7: facades — explicit exports only

- `src/generator/index.ts`: replace `export * from './constants';` with
  `export { MAX_TITLE_LENGTH } from './constants';` (or fold into the existing
  named-export block).
- `src/embeddings/index.ts`: replace `export * from './constants';` with
  `export { MAX_EMBEDDING_INPUT_LENGTH } from './constants';`.
- `src/chat/tools/index.ts`: replace both `export *` with explicit
  named exports of the tool factories actually consumed by `chat/services.ts`.

**Verify**: `rg "export \*" src/` -> no matches; `bun --bun typecheck` -> exit 0.

### Step 8: verify and record

1. `bunx prettier --write` on every changed file.
2. `bun --bun typecheck` -> exit 0.
3. `bun --bun lint` -> exit 0.
4. `bun --bun test src/providers/router.test.ts` -> 2 tests pass.
5. Boot smoke: `/health` -> 200; if `.env` has valid keys, run one chat turn.
6. Write `plans/README.md` status row (IN PROGRESS -> DONE), append a
   `progress.md` entry with the verification evidence.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `bun --bun typecheck` exits 0
- [ ] `bun --bun lint` exits 0
- [ ] `bun --bun test src/providers/router.test.ts` -> 2 tests pass
- [ ] `rg "UIMessage" src/conversation` -> no matches
- [ ] `rg "export \*" src/` -> no matches
- [ ] `rg "loadHistory|RAG_TOP_K|RAG_SIMILARITY_THRESHOLD|UnauthorizedError|ConflictError" src/` -> no matches
- [ ] `rg "embedText|searchNotesHybrid" src/chat/repository.ts` -> no matches
- [ ] `git status` shows only in-scope files modified
- [ ] `plans/README.md` status row updated; `progress.md` entry added

## STOP conditions

Stop and report back (do not improvise) if:

- Live code at the "Current state" locations doesn't match the excerpts (drift).
- Removing a cast breaks `bun --bun typecheck` in a way that requires a new
  non-boundary cast or a widen to `any` / `unknown` — restore the original and
  report instead.
- `searchNotesByRrf` needs to compute the embedding itself (it must receive it
  as a param; do not import `embedText` into the repository).
- A step's verification fails twice after a reasonable fix attempt.
- A change appears to require touching an out-of-scope file.
- `git status` shows unrelated uncommitted changes from plan 001 that would be
  swept into a commit — commit plan 001 separately or ask the operator.

## Maintenance notes

- The remaining casts in the codebase are boundary casts (raw SQL / JSON rows,
  JWT claims); they are intentional and not covered by this plan.
- `extractPlainTextFromParts` and the `role` enum are the only two places the
  `UIMessage` shape may cross a module boundary after this refactor; both are
  boundary casts at a trust boundary.
