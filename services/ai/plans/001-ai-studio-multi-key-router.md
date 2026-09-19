# Plan 001: Switch from Vertex AI to AI-Studio multi-key router

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` and record evidence in `progress.md`.
>
> **Drift check (run first)**: `git diff --stat 366d8bf..HEAD -- src/providers src/config/env.ts src/lib/ai.ts src/lib/retry.ts src/chat/services.ts src/generator/services.ts package.json .env.example .github/workflows/deploy-showcase.yaml`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: migration
- **Planned at**: commit `366d8bf`, 2026-09-18

## Why this matters

`services/ai` currently runs Gemini through Vertex AI (`@ai-sdk/google-vertex`

- service-account JWT). The workshop/demo needs AI Studio free-tier keys
  instead, and each key has hard RPM/RPD caps — so the service must rotate
  across N keys and down an ordered model chain on 429/403, per task (chat,
  title generation, embeddings). Goal: switch provider, remove Vertex entirely,
  add a (key x model) matrix router that bans a failing pair for a cooldown
  window and falls back through the chain.

Demo key count (for the operator): 3 keys recommended, 2 is the floor. Each
key is its own quota bucket; with 3 keys the per-key budget roughly triples.
Tightest per-key free-tier constraints: chat 3.5-flash-lite 15 RPM / 500 RPD,
title 2.5-flash-lite 10 RPM / 20 RPD, embedding 1/2 100 RPM / 1K RPD.

## Current state (verified at plan time)

- `src/providers/agent-platform.ts` — the only Vertex user: builds `JWT` +
  `createVertex`, exports `vertexGemini35FlashLite`, `vertexGeminiEmbedding001`,
  `vertexGemma431bIt`, `vertexGemini25FlashLite`. `gemma` is defined but never
  imported anywhere; the whole file is deleted.
- `src/providers/ai-studio.ts` — dormant single-key stub
  (`createGoogleGenerativeAI({ apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY })`,
  3 stale model idents). Rewritten as thin wrappers around the router.
- `src/config/env.ts:15-19`:
  `GOOGLE_VERTEX_LOCATION` (default `'global'`), `GOOGLE_GENERATIVE_AI_API_KEY`
  (optional), `GOOGLE_VERTEX_PROJECT`, `GOOGLE_CLIENT_EMAIL`,
  `GOOGLE_PRIVATE_KEY`. Comma-split pattern already exists for `ORIGINS`
  (lines 6-12).
- `src/chat/services.ts:24` imports `vertexGemini35FlashLite`; `:194`
  `model:`; `:217` metadata `model: vertexGemini35FlashLite.modelId`.
- `src/generator/services.ts:7` imports `vertexGemini25FlashLite`; `:30`
  `model:`.
- `src/lib/ai.ts` — `embedText()` wraps
  `embed({ providerOptions: { google: { outputDimensionality: 768 } }, model: vertexGeminiEmbedding001 })`
  in `withRetry`.
- `src/lib/retry.ts` — `withRetry` matches
  `APICallError.isInstance(err) && (err.statusCode === 429 || /429/.test(err.message))`,
  backoff 1s/2s/4s.
- `package.json:28` — `@ai-sdk/google-vertex: ^5.0.86`.
  `@ai-sdk/google: ^4.0.74` already present.
- `.env.example:4-9`, `.env.docker`, `.github/workflows/deploy-showcase.yaml:290`
  carry the old vars. No `infra/k8s` / compose references to these vars
  (verified).

Repro conventions to match: snake_case env keys; `@/` strict imports (no
relative paths anywhere in `src/`); `import type` separated from value imports;
no classes / no namespace-object exports — standalone exported functions;
explicit return types on all exported functions; Zod v4 (`import z from 'zod/v4'`);
Prettier `{ useTabs: true, tabWidth: 3, singleQuote: true, trailingComma: none,
printWidth: 100 }`; verification pipeline `./init.sh` = `bun --bun install` ->
`bun --bun typecheck` -> `bun --bun lint`. Commit style from `git log`:
`feat:` / `fix:` / `update:` / `remove:` prefixes, English only.

## Commands you will need

| Purpose              | Command                                       | Expected on success   |
| -------------------- | --------------------------------------------- | --------------------- |
| Dep swap             | `bun --bun install`                           | exit 0                |
| Typecheck            | `bun --bun typecheck`                         | exit 0, no errors     |
| Lint                 | `bun --bun lint`                              | exit 0                |
| Format changed files | `bunx prettier --write <files>`               | exit 0                |
| Router unit test     | `bun --bun test src/providers/router.test.ts` | 2 tests pass          |
| Dead reference scan  | `rg "vertex                                   | agent-platform" src/` | no matches |

## Scope

**In scope** (the only files you should modify):

- `src/providers/router.ts` (new)
- `src/providers/ai-studio.ts` (rewrite)
- `src/providers/agent-platform.ts` (delete)
- `src/providers/router.test.ts` (new)
- `src/config/env.ts`
- `src/lib/ai.ts`
- `src/lib/retry.ts`
- `src/chat/services.ts`
- `src/generator/services.ts`
- `package.json` (+ `bun.lock` regenerated via install)
- `.env.example`
- `.env.docker`
- `.github/workflows/deploy-showcase.yaml` (line 290 only)
- `plans/README.md`, `progress.md`

**Out of scope** (do NOT touch, even though they look related):

- conversation / embeddings / settings business logic, DB / adapters, response
  contracts, compose / K8s config, `tsconfig` / lint configs.
- Transparent mid-stream model swap for an already-open chat stream — the
  next turn gets the fallback. Deliberately not attempted.

## Git workflow

- Branch: create `feat/ai-studio-multi-key-router` if not already on it.
- Commit per logical unit (one per Step group); message style matters: match
  `git log` (e.g. `feat: add multi-key AI Studio router`, `remove: vertex provider`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: `src/config/env.ts` — add new vars (keep old for now)

After `AUTH_JWKS_URL` add:

```ts
GOOGLE_GENERATIVE_AI_API_KEYS: z
    .preprocess(
        (val) => (typeof val === 'string' ? val.split(',').map((v) => v.trim()).filter(Boolean) : val),
        z.array(z.string().min(1)).min(1)
    ),
GOOGLE_GENERATIVE_AI_COOLDOWN_MS: z.coerce.number().int().positive().optional().default(60000),
```

The preprocess mirrors the `ORIGINS` pattern (lines 6-12). Required field, no
default — it is documented in `.env.example` / `.env.docker` / deploy (Step 11).

**Verify**: `bun --bun typecheck` -> exit 0.

### Step 2: Create `src/providers/router.ts`

Verified against the installed `@ai-sdk/google@4`: `createGoogleGenerativeAI`
and the type alias `GoogleGenerativeAIProvider` are exported;
`provider.embeddingModel(id)` is also available.

```ts
import { createGoogleGenerativeAI, type GoogleGenerativeAIProvider } from '@ai-sdk/google';

import { env } from '@/config/env';

export type RouteTask = 'chat' | 'title' | 'embed';
type TaskChains = Record<RouteTask, readonly string[]>;

const CHAINS: TaskChains = {
  chat: [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3-flash',
    'gemini-2.5-flash',
  ],
  title: ['gemini-2.5-flash-lite', 'gemini-3-flash', 'gemini-2.5-flash'],
  embed: ['gemini-embedding-001', 'gemini-embedding-002'],
};

const providers: GoogleGenerativeAIProvider[] = env.GOOGLE_GENERATIVE_AI_API_KEYS.map((apiKey) =>
  createGoogleGenerativeAI({ apiKey }),
);

const bannedUntil = new Map<string, number>(); // `${keyIndex}:${modelId}` -> unix ms expiry
let roundRobinCursor = 0;

function ban(keyIndex: number, modelId: string): void {
  bannedUntil.set(`${keyIndex}:${modelId}`, Date.now() + env.GOOGLE_GENERATIVE_AI_COOLDOWN_MS);
}

function isHealthy(keyIndex: number, modelId: string): boolean {
  const until = bannedUntil.get(`${keyIndex}:${modelId}`);
  return until === undefined || until <= Date.now();
}

export interface PickedProvider {
  provider: GoogleGenerativeAIProvider;
  modelId: string;
  reportRateLimit: () => void;
}

export function pick(task: RouteTask): PickedProvider {
  for (const modelId of CHAINS[task]) {
    for (let step = 0; step < providers.length; step++) {
      const keyIndex = (roundRobinCursor + step) % providers.length;
      const provider = providers[keyIndex];
      if (!provider || !isHealthy(keyIndex, modelId)) continue;
      roundRobinCursor = (keyIndex + 1) % providers.length;
      return { provider, modelId, reportRateLimit: () => ban(keyIndex, modelId) };
    }
  }

  let deBanPair = '';
  let earliest = Number.MAX_SAFE_INTEGER;
  for (const modelId of CHAINS[task]) {
    for (let keyIndex = 0; keyIndex < providers.length; keyIndex++) {
      const until = bannedUntil.get(`${keyIndex}:${modelId}`);
      if (until !== undefined && until < earliest) {
        earliest = until;
        deBanPair = `${keyIndex}:${modelId}`;
      }
    }
  }

  bannedUntil.delete(deBanPair);
  const [keyIndexPart, modelId] = deBanPair.split(':');
  const keyIndex = Number(keyIndexPart);
  const provider = providers[keyIndex];
  if (keyIndexPart === undefined || !modelId || Number.isNaN(keyIndex) || !provider) {
    throw new Error('AI router: no viable (key, model) pair');
  }

  roundRobinCursor = (keyIndex + 1) % providers.length;
  return { provider, modelId, reportRateLimit: () => ban(keyIndex, modelId) };
}
```

Rules honored: no `!`, no `any`, no unsafe casts; `noUncheckedIndexedAccess`
guarded via `if (!provider) continue`. Explicit return type on the exported
function. Note the de-ban path returns the earliest-expiring pair in this
task's chain (a deadlock breaker, not a fair scheduler).

**Verify**: `bun --bun typecheck` -> exit 0.

### Step 3: Rewrite `src/providers/ai-studio.ts`, delete `agent-platform.ts`

```ts
import type { GoogleGenerativeAIProvider } from '@ai-sdk/google';

import { pick } from '@/providers/router';

export interface PickedModel {
  model: ReturnType<GoogleGenerativeAIProvider>;
  modelId: string;
  reportRateLimit: () => void;
}

export interface PickedEmbeddingModel {
  model: ReturnType<GoogleGenerativeAIProvider['embeddingModel']>;
  modelId: string;
  reportRateLimit: () => void;
}

export function getChatModel(): PickedModel {
  const { provider, modelId, reportRateLimit } = pick('chat');
  return { model: provider(modelId), modelId, reportRateLimit };
}

export function getTitleModel(): PickedModel {
  const { provider, modelId, reportRateLimit } = pick('title');
  return { model: provider(modelId), modelId, reportRateLimit };
}

export function getEmbeddingModel(): PickedEmbeddingModel {
  const { provider, modelId, reportRateLimit } = pick('embed');
  return { model: provider.embeddingModel(modelId), modelId, reportRateLimit };
}
```

Delete `src/providers/agent-platform.ts` entirely (no importers remain after
Steps 6-7).

**Verify**: `bun --bun typecheck` -> exit 0.

### Step 4: `src/lib/retry.ts` — share the rate-limit gate, include 403

Add an exported named gate and use it in `withRetry`:

```ts
export function isRateLimitOrQuota(err: unknown): boolean {
  return APICallError.isInstance(err) && (err.statusCode === 429 || err.statusCode === 403);
}
```

Replace the inline `isRateLimit` computation in `withRetry` with
`isRateLimitOrQuota(err)`. Keep the backoff schedule (1s, 2s, 4s) and the
`throw lastErr` escape.

**Verify**: `bun --bun typecheck` -> exit 0.

### Step 5: `src/lib/ai.ts` — repick per retry, report to router

```ts
export async function embedText(text: string) {
  try {
    const { embedding } = await withRetry(async () => {
      const picked = getEmbeddingModel();
      try {
        return await embed({
          providerOptions: {
            google: {
              outputDimensionality: 768,
            },
          },
          model: picked.model,
          value: text,
        });
      } catch (error) {
        if (isRateLimitOrQuota(error)) picked.reportRateLimit();
        throw error;
      }
    });
    return embedding;
  } catch (e) {
    console.error('[Embedding failed]:', e);
    return null;
  }
}
```

Imports: `getEmbeddingModel` from `@/providers/ai-studio`;
`isRateLimitOrQuota` from `@/lib/retry` (withRetry already imported).

**Verify**: `bun --bun typecheck` -> exit 0.

### Step 6: `src/chat/services.ts` — use `getChatModel()`

- Replace `import { vertexGemini35FlashLite } from '@/providers/agent-platform';`
  (line 24) with `import { getChatModel } from '@/providers/ai-studio';` and add
  `import { isRateLimitOrQuota } from '@/lib/retry';`.
- At the top of `createChatStreamResponse` body add `const picked = getChatModel();`.
- `streamText` options: `model: picked.model` (was line 194) and
  `onError: ({ error }) => { if (isRateLimitOrQuota(error)) picked.reportRateLimit(); console.error('[Chat streamText error]:', error); }`.
- Metadata in `onEnd` (was line 217): `model: picked.modelId` — this auto-records
  whichever fallback actually ran.

**Verify**: `bun --bun typecheck` -> exit 0.

### Step 7: `src/generator/services.ts` — use `getTitleModel()`

- Replace `import { vertexGemini25FlashLite } from '@/providers/agent-platform';`
  (line 7) with `import { getTitleModel } from '@/providers/ai-studio';`.
- In `generateText` options use `model: getTitleModel().model` (was line 30).

**Verify**: `bun --bun typecheck` -> exit 0.

### Step 8: `src/config/env.ts` — remove old vars

Delete from the `server` block: `GOOGLE_VERTEX_LOCATION`,
`GOOGLE_GENERATIVE_AI_API_KEY`, `GOOGLE_VERTEX_PROJECT`, `GOOGLE_CLIENT_EMAIL`,
`GOOGLE_PRIVATE_KEY`. (Ordered after Steps 6-7 so nothing references them.)

**Verify**: `bun --bun typecheck` -> exit 0; `rg "GOOGLE_VERTEX|GOOGLE_CLIENT_EMAIL|GOOGLE_PRIVATE_KEY" src/` -> no matches.

### Step 9: `package.json` + lockfile

Remove the `@ai-sdk/google-vertex` line. Run `bun --bun install`.

**Verify**: `rg "google-vertex" package.json bun.lock` -> no matches; `bun --bun typecheck` -> exit 0.

### Step 10: Add `src/providers/router.test.ts`

No test infra exists in-repo; use Bun's built-in runner (`bun:test`) for a
deterministic smoke of the chain/cooldown/de-ban logic (no network — AI SDK
providers construct lazily). The env var must be set before the router module
is evaluated, so import `ai-studio` dynamically inside the tests.

```ts
import { beforeAll, describe, expect, test } from 'bun:test';

type GetChatModel = Awaited<ReturnType<typeof import('@/providers/ai-studio')>>['getChatModel'];

let getChatModel: GetChatModel;

beforeAll(async () => {
  process.env.GOOGLE_GENERATIVE_AI_API_KEYS = 'fake-key';
  ({ getChatModel } = await import('@/providers/ai-studio'));
});

describe('AI Studio multi-key router', () => {
  test('a banned (key, model) pair advances down the chat chain', () => {
    const first = getChatModel();
    expect(first.modelId).toBe('gemini-3.5-flash-lite');
    first.reportRateLimit();
    expect(getChatModel().modelId).toBe('gemini-3.1-flash-lite');
  });

  test('all-banned chain de-bans the earliest-expiring pair', () => {
    let modelId = '';
    for (let i = 0; i < 8; i++) {
      const picked = getChatModel();
      modelId = picked.modelId;
      picked.reportRateLimit();
    }
    expect(modelId).toBe('gemini-2.5-flash');
    expect(getChatModel().modelId).toBe('gemini-3.5-flash-lite');
  });
});
```

**Verify**: `bun --bun test src/providers/router.test.ts` -> 2 tests pass.

### Step 11: env files + deploy workflow

- `.env.example` lines 4-9 become:
  ```
  GOOGLE_GENERATIVE_AI_API_KEYS=
  GOOGLE_GENERATIVE_AI_COOLDOWN_MS=60000
  TAVILY_API_KEY=
  ```
  (drop `GOOGLE_GENERATIVE_AI_API_KEY`, `GOOGLE_CLIENT_EMAIL`,
  `GOOGLE_VERTEX_LOCATION`, `GOOGLE_VERTEX_PROJECT`, `GOOGLE_PRIVATE_KEY`).
- `.env.docker`: verified it contains NO Google vars (only PORT, DATABASE_URL,
  RABBITMQ_URL, AUTH_JWKS_URL). Append a single
  `GOOGLE_GENERATIVE_AI_API_KEYS=` line holding the comma-joined real keys —
  the operator fills the value locally; never commit real key values. Left
  empty, the required-variable validation fails fast at boot, which is the
  intended fail-fast behavior.
- `.github/workflows/deploy-showcase.yaml` line 290: replace
  `@@@GOOGLE_GENERATIVE_AI_API_KEY=${{ secrets.AI_GOOGLE_GENERATIVE_AI_API_KEY }}@@@GOOGLE_CLIENT_EMAIL=${{ secrets.AI_GOOGLE_CLIENT_EMAIL }}@@@GOOGLE_VERTEX_PROJECT=${{ secrets.AI_GOOGLE_VERTEX_PROJECT }}@@@GOOGLE_PRIVATE_KEY=${{ secrets.AI_GOOGLE_PRIVATE_KEY }}`
  with `@@@GOOGLE_GENERATIVE_AI_API_KEYS=${{ secrets.AI_GOOGLE_GENERATIVE_AI_API_KEYS }}`
  (keep `TAVILY_API_KEY`). The `@@@` separated line keeps its overall grammar:
  `DATABASE_URL ... AUTH_JWKS_URL ... ORIGINS ... GOOGLE_GENERATIVE_AI_API_KEYS ... TAVILY_API_KEY`.
- Manual ops note (not code): create a repo secret `AI_GOOGLE_GENERATIVE_AI_API_KEYS`
  containing the comma-joined keys; the four old Vertex secrets can then be deleted.

**Verify**: each file edited; `rg "GOOGLE_VERTEX|GOOGLE_CLIENT_EMAIL|GOOGLE_PRIVATE_KEY" .github services/ai --glob '!.env.docker'` -> only `.env.docker` may still appear if left with real values (expected: it should have none after the edit).

### Step 12: Verify and record

- `bunx prettier --write` on every changed file (src + env files + workflow).
- `bun --bun typecheck` -> exit 0.
- `bun --bun lint` -> exit 0.
- Smoke with 3 **valid** keys set in `.env.docker`: boot the service, hit
  `/health`, run one chat stream turn, one title-gen, one embedding; confirm
  chat metadata records the primary `modelId`.
- Write `plans/README.md` (index; this plan DONE), add a `progress.md` entry
  summarizing the change + verification evidence.

**Verify**: the commands above all succeed.

## Test plan

- One new test file, `src/providers/router.test.ts`, via `bun:test` (Bun
  ships its own runner; no framework install). Covers: (a) happy-path rotation
  to the next chain model after a cooldown ban; (b) deadlock breaker re-issuing
  the earliest-expiring pair when the whole chain is banned.
- No existing test files to model after (repo has none).
- Verification: `bun --bun test src/providers/router.test.ts` -> 2 pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `bun --bun typecheck` exits 0
- [ ] `bun --bun lint` exits 0
- [ ] `bun --bun test src/providers/router.test.ts` -> 2 tests pass
- [ ] `rg "vertex|agent-platform|GOOGLE_CLIENT_EMAIL|GOOGLE_PRIVATE_KEY|GOOGLE_VERTEX" src/` -> no matches
- [ ] `rg "google-vertex" package.json bun.lock` -> no matches
- [ ] `git status` shows only in-scope files modified
- [ ] `plans/README.md` status row updated; `progress.md` entry added
- [ ] Smoke: /health, chat stream, title-gen, embedding all OK with valid keys

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the "Current state" locations doesn't match the excerpts (drift).
- `@ai-sdk/google@4` does not export `GoogleGenerativeAIProvider` /
  `createGoogleGenerativeAI`, or `embed()` rejects the embedding model type —
  do not cast / assert your way around it.
- A step's verification fails twice after a reasonable fix attempt.
- The demo will run with an **invalid** API key (401/400): `reportRateLimit`
  fires only on 429/403 by design, so a broken key will not rotate. Valid keys
  or a design revisit is required, not a code hack.
- A change appears to require touching an out-of-scope file.

## Maintenance notes

- `reportRateLimit` is quota-only (429/403) by design. Invalid-key errors
  (400/401) don't ban a pair — revisit only if the demo must tolerate a bad key.
- Streaming chat cannot transparently swap mid-stream; the fallback applies to
  the next turn, and the persisted `modelId` metadata proves which model ran.
- `roundRobinCursor` is a single module-level cursor shared across tasks —
  fine for <= a handful of keys. Move to per-(task, model) cursors only if load
  or fairness needs grow.
- The de-ban path is a deadlock breaker (earliest expiry), not a scheduler.
- If model IDs in `CHAINS` drift from the AI Studio catalog, the literal ids
  here are the source of truth the operator chose; update the chains in one
  place (`router.ts`).
