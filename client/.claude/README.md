# Synapse Client Agent Context

Minimal context for agents working inside `client/`. Works with any agent that
reads `AGENTS.md` — not tool-specific.

Read, in order:

1. `AGENTS.md` (repo root — entry point, always read)
2. `.agents/rules/*.md` (always, short — `typescript.md`, `i18n.md`,
   `security.md`, `phase-gate.md`, `ponytail.md`, `forms-and-views.md`,
   `improve.md`)
3. relevant file(s) under `docs/` only if the task needs them (see AGENTS.md →
   Startup workflow)
4. Skills under `.claude/skills/`: always-active (`improve`,
   `modern-javascript-patterns`, `vercel-composition-patterns`), plus the ONE
   skill the current task needs — pick it from the routing table in AGENTS.md →
   "Skills & Rules"

Do not load the whole documentation set for every task.