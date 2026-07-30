# Session Progress Log

## Current State

**Last Updated:** 2026-07-30
**Session ID:** notes-page-layout-refresh
**Active Feature:** Notes page layout + breadcrumb system + sidebar content reorganization

## Status

### What's Done

- [x] **Breadcrumb system** — `src/types/breadcrumb.ts` (route type augmentation), `src/hooks/use-breadcrumb.ts` (useMatches + staticData + aliases), `src/components/common/app-breadcrumb.tsx` (shadcn wiring)
- [x] **i18n keys** — Added 16 new keys to both en.json and vi.json (sidebar, header, notes page)
- [x] **Sidebar content reorganization** — NavMain: "Knowledge" group (Notes, Starred, Tags, Trash), NavCompanion: "AI Companion" group (New Chat, History, Servant Mode with Switch), NavSecondary: added Settings route link
- [x] **Global top header** — Replaced wide search bar with compact search icon button (+ tooltip), added "+ New" dropdown (icon-only, navigates to /notes/create)
- [x] **NotesTagFilter component** — Horizontal scrollable hardcoded filter chips (All, #work, #ideas, #personal, #design + add button)
- [x] **NotesViewToggle component** — Grid/Table toggle buttons with tooltips
- [x] **NotesBulkActions component** — New fixed bottom bar (replaces floating NoteBatchActions) with Pin/Tag/Delete/Clear
- [x] **Notes page route** — Added staticData.breadcrumb, AppBreadcrumb, NotesTagFilter, NotesViewToggle, NotesBulkActions, FAB auto-hide (scale-0 + pointer-events-none) when bulk active
- [x] **Note detail route** — Added staticData.breadcrumb with dynamic resolution from loaderData
- [x] **Verification** — `bun --bun install`, `bun --bun check` (prettier + oxlint + eslint) pass

### What's In Progress

- (none)

### What's Next

Remaining features from `feature_list.json` (not-started):
1. AI Tab Completion Plugin (feat-023)
2. Voice-to-Text in Notes (feat-024)
3. PDF Export (feat-027)
4. Quick Note Dialog (feat-028)

## Key Findings

- TanStack Router's `staticData` + `useMatches()` pattern provides clean breadcrumb resolution without extra context/providers
- shadcn's base-ui Tooltip needs `TooltipProvider` wrapper and `render` prop instead of `asChild`
- Paraglide message keys must be added to both en.json and vi.json simultaneously
- FAB auto-hide via `scale-0 pointer-events-none opacity-0` is smoother than conditional rendering
- View mode state is local (useState) for now; can promote to URL search param later

## Blockers / Risks

- None

## Decisions Made

- **View mode state**: Local useState in notes page. Can be promoted to URL search param when view persistence is needed.
- **Tag filter**: Hardcoded example data only. Backend integration will use the actual tag query when ready.
- **FAB behavior**: Auto-hide (scale-0) on bulk select (Way 1 per user spec). FAB is md:hidden (mobile only).
- **Bulk actions**: New simplified `NotesBulkActions` replaces `NoteBatchActions`. Old component kept in tree but no longer imported.

## Files Changed This Session

- `messages/en.json` — Added 16 new keys
- `messages/vi.json` — Added 16 new keys
- `src/types/breadcrumb.ts` — New (route type augmentation)
- `src/hooks/use-breadcrumb.ts` — New (breadcrumb hook)
- `src/components/common/app-breadcrumb.tsx` — New (shared component)
- `src/layouts/app/sidebar/nav/nav-main.tsx` — Knowledge group with Starred/Trash, removed Settings
- `src/layouts/app/sidebar/nav/nav-companion.tsx` — AI Companion group with Servant Mode Switch
- `src/layouts/app/sidebar/nav/nav-secondary.tsx` — Added Settings route link
- `src/layouts/app/app-top-header.tsx` — Compact search icon + "+ New" dropdown
- `src/features/notes/components/list/notes-tag-filter.tsx` — New (hardcoded filter chips)
- `src/features/notes/components/list/notes-view-toggle.tsx` — New (Grid/Table toggle)
- `src/features/notes/components/list/notes-bulk-actions.tsx` — New (fixed bottom bar)
- `src/routes/_app/notes/index.tsx` — Added breadcrumb, tag filter, view toggle, bulk actions, FAB auto-hide
- `src/routes/_app/notes/$noteId.tsx` — Added staticData.breadcrumb with dynamic resolution

## Evidence of Completion

- [x] All 14 tasks implemented
- [x] `bun --bun install` passes
- [x] `bun --bun check` passes (prettier + oxlint + eslint --fix)
- [x] Repository restartable from `./init.sh`

## Notes for Next Session

- Remaining features: AI Tab Completion (feat-023), Voice-to-Text (feat-024), PDF Export (feat-027), Quick Note Dialog (feat-028)
- Tag filter is hardcoded — wire to real tag data when tags API is ready
- View toggle state is local — promote to URL search param if persistence needed
