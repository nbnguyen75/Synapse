# Synapse Web — Tech Stack

## Runtime & Tooling

- **Package manager / runtime:** Bun (`bun --bun ...` used for scripts, lint-staged, checks)
- **Build tool:** Vite 8
- **Language:** TypeScript (via `@typescript/native` / TS 6, strict setup)
- **Linting:** oxlint + ESLint 10 (`eslint-plugin-oxlint`, `eslint-plugin-perfectionist`,
  `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `typescript-eslint`)
- **Formatting:** Prettier 3
- **Git hooks:** Husky + lint-staged (`bun --bun check` on staged files)

## Framework & Routing

- **UI:** React 19
- **Routing:** TanStack Router (file-based, with codegen via `tsr generate` /
  `@tanstack/router-plugin`), plus devtools
- **Data fetching / server state:** TanStack Query 5 (+ devtools)
- **Compiler:** React Compiler (`babel-plugin-react-compiler`)

## State Management

- **Client state:** Zustand 5

## UI Layer

- **Component primitives:** shadcn/ui (https://ui.shadcn.com/llms.txt) — **core styling library, mandatory**
- **Secondary UI/animation library:** Aceternity UI (https://ui.aceternity.com/llms.txt) — for advanced animated components not covered by shadcn
- **Styling:** Tailwind CSS v4+ (already installed — confirm all new code targets v4 syntax, not v3)
- **Dark mode:** implemented per shadcn's official Vite guide — https://ui.shadcn.com/docs/dark-mode/vite
- **Icons:** Iconify (`@iconify/react`) — use the `simple-icons` set specifically for brand/company logos; use `lucide-react` for general UI icons
- **Theme colors:** any color token added/modified in shadcn's theme config must use **OKLCH**, not hex/rgb/hsl

## Data Fetching

- **TanStack Query** — mandatory for all data fetching, no raw `fetch` calls in components
- **better-fetch** (`better-fetch`, already installed) — paired with TanStack Query for end-to-end type safety on requests

## Routing

- **TanStack Router** — mandatory, file-based routing only (already the standard — this reaffirms it as non-optional)

## Forms & Validation

- **shadcn `Form`** component + `react-hook-form` + `zod` — mandatory combination for all forms, no ad hoc form state
- **zod** — mandatory for all schema validation, not just forms

## HTTP Status Handling

- **`http-status-codes`** — use named constants (e.g. `StatusCodes.NOT_FOUND`) for any HTTP status comparison; never compare against raw numbers.

## AI / Chat UI

- Vercel **AI SDK** (`ai`) for streaming chat with the AI service
- `streamdown` (+ `@streamdown/cjk`, `@streamdown/code`, `@streamdown/math`,
  `@streamdown/mermaid`) for rendering streamed AI markdown/code/math output
- `react-markdown` + `remark-gfm` for general markdown rendering
- `tokenlens` for token/usage estimation
- `shiki` for syntax highlighting
- `ansi-to-react` for rendering terminal-style output if needed
- `use-stick-to-bottom` for auto-scrolling chat windows

## AI UI

- **AI SDK Elements** (https://elements.ai-sdk.dev/llms.txt) — mandatory for any UI component that renders AI output or AI interaction (chat bubbles, streaming text, tool-call displays, etc.), on top of the existing `ai` SDK and `streamdown` for raw markdown/code rendering. _(already installed, check src/components/ai-elements)_

## Authentication

- **better-auth** react client (`better-auth`, already installed) — mandatory, no custom auth state/session handling outside it

## Editor

- Lexical (`lexical`, `@lexical/react`, `@lexical/markdown`) — for rich note editing
- `react-jsx-parser` — for rendering limited dynamic JSX content if needed

## Charts

- `recharts` — pinned to `3.10.0` (not caret-ranged — do not bump casually)

## Auth

- `better-auth` (client) + `better-fetch` for typed fetch calls to the Auth service

## Diagrams / Flow

- `@xyflow/react` — for any visual flow/graph UI (e.g. agentic tool-call visualization)

## i18n

- `@inlang/paraglide-js` (compiler-based i18n) — see ARCHITECTURE.md for usage rules

## Env / Config

- `@t3-oss/env-core` for typed, validated environment variables

## Utilities

- `lodash`, `nanoid`

## Scripts Reference

| Script                 | Purpose                                                             |
| ---------------------- | ------------------------------------------------------------------- |
| `dev`                  | Start Vite dev server                                               |
| `build`                | Type-check (`tsc -b`) then Vite build                               |
| `preview`              | Preview production build                                            |
| `generate-routes`      | Regenerate TanStack Router route tree (`tsr generate`)              |
| `generate-translation` | Compile Paraglide translations (also runs on `postinstall`)         |
| `lint`                 | `oxlint` + `eslint`                                                 |
| `format`               | Prettier write                                                      |
| `check`                | Prettier + oxlint --fix + eslint --fix (used by lint-staged and CI) |

## Version Notes

- React 19, Vite 8, Tailwind 4, TanStack Router/Query 5.x, ESLint 10 — this is a
  bleeding-edge stack. Don't downgrade to "familiar" older APIs (e.g. old
  Tailwind config syntax, old React Router patterns) out of habit — check the
  installed major version before writing code.
- `typescript` maps to `@typescript/typescript6` — TS 6 syntax/behavior applies.
