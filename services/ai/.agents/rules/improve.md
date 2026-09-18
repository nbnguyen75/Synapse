# Improve Skill Rules — Synapse AI Service

Strict rule: The `improve` skill is ALWAYS active and executed across all workflows, feature implementations, refactors, and codebase reviews.

## 1. Always Run Improve Skill

- **Continuous Execution**: Always consult and execute the `improve` skill when surveying the codebase, planning new features, refactoring existing modules, auditing code quality, or handling architectural changes.
- **Advisor Mindset**: Apply senior-advisor evaluation across all tasks — identify high-leverage opportunities, avoid over-engineering, detect technical debt, assess performance and security impacts, and verify adherence to Synapse modular service boundaries (`route.ts` -> `services.ts` -> `repository.ts`).

## 2. Plan Quality & Self-Containment

- **Self-Contained Plans**: Whenever creating implementation or refactoring plans, ensure every plan is fully self-contained with explicit verification commands, exact file paths, and clear acceptance criteria.
- **Verification Baseline**: Every plan and improvement workflow must define exact build, lint, and typecheck commands (`./init.sh`, `bun run typecheck`, `bun run lint`) as verification gates.

## 3. Scope & Modularity

- **Respect Domain Boundaries**: Ensure any proposed improvement or refactor strictly adheres to module separation (e.g. `src/chat`, `src/conversation`, `src/embeddings`, `src/generator`, `src/settings`), explicit minimal index facades, Zod v4 contracts, and strict non-relative import conventions (`@/...`).

## 4. Plan Numbering, Lifecycle & Archiving

- **Global Monotonic Numbering**: When drafting new plans, ALWAYS scan both `plans/*.md` AND `plans/archive/*/*.md` to calculate the next sequence index: `MAX(existing_plan_number) + 1`. Never reset plan numbering to `001` or reuse an existing number even if the root `plans/` directory is clean.
- **Archive Awareness in Reconcile**: During `improve reconcile` or after finishing a batch, check root `plans/`. If completed plans reach a 20–30 plan range (e.g. `021-050`) or root exceeds 20 files, trigger archiving into `plans/archive/XXX-YYY/`.
- **Link & Index Integrity**: Keep `plans/README.md` clean for active plans with an Archived Batches reference table. Keep `plans/archive/README.md` updated as the historical master log. Never leave dangling broken links.
