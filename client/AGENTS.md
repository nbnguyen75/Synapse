# AGENTS.md

Project harness for reliable agent-assisted development on synapse-web
(TypeScript + React + Vite, Bun-managed).

## Startup Workflow

Before writing code:

1. **Confirm working directory** with `pwd`
2. **Read this file** completely
3. **Read project docs** — all four, in this order:
   - `docs/PRODUCT.md` — what Synapse is, what this client does
   - `docs/ARCHITECTURE.md` — feature-driven folder structure, routing, i18n rules
   - `docs/TECH_STACK.md` — what's already installed; check before adding a dependency
   - `docs/RULES.md` — enforceable rules and split-component triggers; this is
     the checklist your diff gets held to
4. **Run `./init.sh`** to verify environment is healthy
5. **Read `feature_list.json`** to see current feature state
6. **Review recent commits** with `git log --oneline -5`

If baseline verification is failing, repair that first before adding new scope.

## Working Rules

- **One feature at a time**: Pick exactly one unfinished feature from `feature_list.json`
- **Follow `docs/RULES.md`**: file naming (kebab-case), thin routes, feature-first
  placement, `@/` path aliases, Rule of Three, i18n via Paraglide only
- **Verification required**: Don't claim done without running verification commands
- **Update artifacts**: Before ending session, update `progress.md` and `feature_list.json`
- **Stay in scope**: Don't modify files unrelated to the current feature
- **Never hand-edit `src/paraglide/**`**: it's generated — edit `messages/en.json` /
  `messages/vi.json` and run `bun run generate-translation` instead
- **Leave clean state**: Next session must be able to run `./init.sh` immediately

## Required Artifacts

- `feature_list.json` — Feature state tracker (source of truth)
- `progress.md` — Session continuity log
- `init.sh` — Standard startup and verification path
- `session-handoff.md` — Optional, for larger sessions

## Definition of Done

A feature is done only when ALL of the following are true:

- [ ] Target behavior is implemented
- [ ] Placed per `docs/ARCHITECTURE.md` (feature folder, thin route, correct layer)
- [ ] No violations of the split-component triggers in `docs/RULES.md`
       (prop explosion, ternary pyramid, inline `.map()` state, `useEffect` tower, prop drilling)
- [ ] New user-facing strings added to Paraglide (`messages/en.json` AND `messages/vi.json`), not hardcoded
- [ ] Required verification actually ran (`./init.sh`)
- [ ] Evidence recorded in `feature_list.json` or `progress.md`
- [ ] Repository remains restartable from standard startup path

## End of Session

Before ending a session:

1. Update `progress.md` with current state
2. Update `feature_list.json` with new feature status
3. Record any unresolved risks or blockers
4. Commit with descriptive message once work is in safe state
5. Leave repo clean enough for next session to run `./init.sh` immediately

## Verification Commands

```bash
# Full verification (recommended)
./init.sh
```

Active checks (mirrors `init.sh`):
```bash
bun --bun install
bun --bun check       # prettier --write + oxlint --fix + eslint --fix
```

Disabled for now (commented out in `init.sh` — enable when you want stricter
gating, e.g. before a milestone or in CI):
```bash
bun --bun lint         # oxlint + eslint, no-fix
tsc -b                 # type-check
bun --bun run build
```

## Escalation

If you encounter:
- **Architecture decisions**: Consult `docs/ARCHITECTURE.md`, otherwise ask user
- **Unclear requirements**: Consult `docs/PRODUCT.md`, otherwise ask user
- **Dependency question** ("do I need to install X?"): Check `docs/TECH_STACK.md` first —
  most needs (forms, dates, charts, streaming AI text, markdown) are already covered
- **Repeated test failures**: Update progress, flag for human review
- **Scope ambiguity**: Re-read `feature_list.json` for definition of done
- **Rule conflict**: If a `docs/RULES.md` rule conflicts with existing code patterns,
  ask the user — don't silently pick a side (per RULES.md itself)