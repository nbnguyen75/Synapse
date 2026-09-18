# TypeScript Strict Rules for AI Agents

Strict mode stays on. Fix the type — never suppress the error.

## 1. Zero Tolerance for Type Escapes

- **No `any`**: Never use `any` or `as any`. Use `unknown` with runtime type guard or Zod schema validation.
- **No `@ts-ignore`**: Absolutely forbidden. `@ts-expect-error` is allowed ONLY with a mandatory description, and ONLY for temporary upstream library bugs — never to hide your own code issue.
- **No Unsafe Type Assertions (`as T`)**: Never use `as T` to paper over type mismatches or blind-cast database payloads. Validate with Zod or Drizzle schema types instead.
- **No Non-Null Assertion (`!`)**: Never use the `!` operator (e.g., `user!.id`). Handle `null` and `undefined` using optional chaining (`?.`), nullish coalescing (`??`), or explicit `if` guards.

## 2. Array & Record Safety

- **Unchecked Index Access Enabled**: `noUncheckedIndexedAccess` is active. Array indexing (`arr[0]`) or dynamic object lookup (`map[key]`) always returns `T | undefined`.
- Always check for `undefined` before accessing properties on indexed access results.

## 3. External Data & Validation

- **All External Data Must Be Validated**: Request body, query parameters, route params, or environment variables must be validated at runtime using **Zod** or Hono's `@hono/zod-validator`. Do not trust raw payloads.
- **Zod v4 Import Standard**: ALWAYS use `import { z } from 'zod/v4';` and `import { ZodError } from 'zod/v4';`. Direct imports from `'zod'` are forbidden.

## 4. Functions, Architecture & Return Types

- **Functional Architecture (No Classes, No Namespace / Wrapper Objects)**: Do not use `class` or namespace object bundles (e.g. `export const aiRouter = { ... }` or `export const notesService = { ... }`). Export individual standalone functions directly (`export function ...` / `export async function ...` or `export { funcA, funcB }`).
- **Explicit Return Types**: Always declare return types for exported functions, domain services, and repository calls. Do not rely on loose type inference for public interfaces.
- **No Implicit Returns**: Every code path in a function must explicitly return a value or throw a typed error.
- **No Synthetic Test Bypasses**: Never add synthetic bypass headers (`x-test-user-id`) or test-mode branching shortcuts in production code.

## 5. Promises & Async Safety

- **No Floating Promises**: Every promise must be handled: `await` it, return it, or attach `.catch()`. In route handlers, ensure unhandled promise rejections are caught by Hono's global error handler.

## 6. Type Definitions, Imports & Exports

- **Prefer Discriminated Unions**: Model state variations using tagged unions (`{ success: true; data: T } | { success: false; error: string }`).
- **Type-only Imports**: Use `import type` (separate from value imports) — enforced by Oxlint/ESLint.
- **Strict Non-Relative Imports Across All `src/` Files**: ALWAYS use non-relative path aliases (`@/...`) for ALL files inside `src/`. Relative imports (`../`, `./`) are strictly forbidden across the entire `src/` tree.
- **Explicit & Minimal Exports Only in `index.ts`**: Do NOT use wildcard exports (`export * from '...'`). In `index.ts` (at feature root or submodule levels), only export functions, types, and schemas that are **ACTUALLY NEEDED** by external modules, submodules, or the root app. Never export internal helpers or unused private functions into `index.ts`. Keep public module APIs lean and intentional.
- **Prefer Explicit Concrete Types**: Simple, readable types beat complex generic abstractions.

## 7. Strict English Standard for Documentation, API Messages & Prompts

- **English Only Everywhere**: All documentation, agent markdown files, code comments, API error messages, exception messages, HTTP reason phrases, validation errors, tool descriptions, and AI prompts/instructions MUST be written exclusively in English.
- **No Language Mixing**: Never mix English and Vietnamese in code, documentation, agent rules, or API error payloads. Agent documentation must always be written and maintained in pure English.

## 8. Operational Escalation

- Don't modify `tsconfig.json` strictness, `oxlint.config.ts` severities, or bypass checks to force a task to pass — fix the root cause.
