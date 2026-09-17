# TypeScript Strict Rules for AI Agents

Strict mode stays on. Fix the type — never suppress the error.

## 1. Zero Tolerance for Type Escapes

- **No `any`**: Never use `any` or `as any`. Use `unknown` with runtime type guard or Zod schema validation.
- **No `@ts-ignore`**: Absolutely forbidden. `@ts-expect-error` is allowed ONLY with a mandatory description, and ONLY for temporary upstream library bugs — never to hide your own code issue.
- **No Unsafe Type Assertions (`as T`)**: Never use `as T` to paper over type mismatches or blind-cast external payloads. Validate with Zod instead.
- **No Non-Null Assertion (`!`)**: Never use the `!` operator (e.g., `user!.name`). Handle `null` and `undefined` using optional chaining (`?.`), nullish coalescing (`??`), or explicit `if` guards.

## 2. Array & Record Safety

- **Unchecked Index Access Enabled**: `noUncheckedIndexedAccess` is active. Array indexing (`arr[0]`) or dynamic object lookup (`map[key]`) always returns `T | undefined`.
- Always check for `undefined` before accessing properties on indexed access results.

## 3. External Data & Validation

- **All External Data Must Be Validated**: API responses, Tauri IPC calls, `localStorage`, or route search params must be validated at runtime using **Zod** (`import { z } from 'zod/v4';`). Do not cast raw responses into interfaces.
- **Form Schemas with Zod v4**: Define strict Zod schemas for all forms (create, edit, login, register) and wire them to `@tanstack/react-form`.
- **Validation Messages via Paraglide**: ALWAYS supply error messages for Zod validations using Paraglide message functions (`import { m } from '@/paraglide/messages';`), e.g., `z.string().min(1, m.notes_content_required_warning())`.

## 4. Functions & Return Types

- **Explicit Return Types**: Always declare return types for exported functions, complex helpers, and custom hooks. Do not rely on type inference for public interfaces.
- **No Implicit Returns**: Every code path in a function must explicitly return a value.

## 5. Promises & Async Safety

- **No Floating Promises**: Every promise must be handled: `await` it, return it, attached with `.catch()`, or explicitly marked as fire-and-forget using `void promise`.
- Pay extra attention inside React event handlers, `useEffect`, and Tauri command invocations.

## 6. Type Definitions & Imports

- **Non-Relative Imports Only**: ALL imports MUST be non-relative (`@/...`).
  - Outside feature imports from feature root: `@/features/<feature>`.
  - Inside feature imports from subfolders: `@/features/<feature>/schemas`, `@/features/<feature>/hooks`, etc.
- **Prefer Discriminated Unions**: Model state variations using tagged unions (`{ status: 'success'; data: T } | { status: 'error'; error: Error }`) instead of optional field soup (`{ status; data?; error? }`).
- **Type-only Imports**: Use `import type` (separate from value imports) — enforced by Oxlint/ESLint.
- **Prefer Explicit Concrete Types**: Simple, readable types beat complex generic abstractions.

## 7. Operational Escalation

- Don't modify `tsconfig.json` strictness, `oxlint.config.ts` severities, or bypass checks to force a task to pass — escalate instead (see `AGENTS.md` → Escalation).
- Don't introduce new state-management or data-fetching abstractions — TanStack Query and TanStack Router are the only sanctioned libraries.
