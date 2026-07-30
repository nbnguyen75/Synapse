# Session Progress Log

## Current State

**Last Updated:** 2026-07-30
**Session ID:** feat-031-url-driven-views
**Active Feature:** URL-driven view architecture (feat-031)

## Status

### What's Done (feat-030 — Layout Refresh)

- [x] **Breadcrumb system** — `src/types/breadcrumb.ts` (route type augmentation), `src/hooks/use-breadcrumb.ts` (useMatches + staticData + aliases), `src/components/common/app-breadcrumb.tsx` (shadcn wiring)
- [x] **i18n keys** — Added 16 new keys to both en.json and vi.json (sidebar, header, notes page)
- [x] **Sidebar content reorganization** — NavMain: "Knowledge" group (Notes, Starred, Tags, Trash), NavCompanion: "AI Companion" group (New Chat, History, Servant Mode with Switch), NavSecondary: added Settings route link
- [x] **Global top header** — Replaced wide search bar with compact search icon button (+ tooltip), added "+ New" dropdown (icon-only, navigates to /notes/create)
- [x] **NotesTagFilter component** — Horizontal scrollable hardcoded filter chips (All, #work, #ideas, #personal, #design + add button)
- [x] **NotesViewToggle component** — Grid/Table toggle buttons with tooltips
- [x] **NotesBulkActions component** — Fixed bottom bar (replaces floating NoteBatchActions) with Pin/Tag/Delete/Clear
- [x] **Notes page route** — Added staticData.breadcrumb, AppBreadcrumb, NotesTagFilter, NotesViewToggle, NotesBulkActions, FAB auto-hide (scale-0 + pointer-events-none) when bulk active
- [x] **Note detail route** — Added staticData.breadcrumb with dynamic resolution from loaderData
- [x] **Verification** — `bun --bun install`, `bun --bun check` pass

### What's Done (feat-031 — URL-Driven Views)

- [x] **Phase 0: Pagination alignment** — `DEFAULT_NOTES_QUERY_PARAMS.pageSize` 10→20, `EMPTY_PAGINATED.size` 10→20, `EMPTY_PAGINATED.page` 1→0. Page conversion in `getNotes()` (page - 1).
- [x] **Phase 1: Schema + API + Hooks** — Added `archived`, `trashed`, `favorite` filters + `NoteViewMode` type. `trashedAt` field. 8 new individual action functions + 5 bulk functions. 8 new mutation hooks with toast messages.
- [x] **Phase 2: NotesViewPage shared component** — Encapsulates NotesList, Paginator, FAB, bulk bar, empty state, sort dropdown, view toggle. Extracted from `notes/index.tsx`.
- [x] **Phase 3: View-specific note-card + bulk-actions + empty-state** — viewMode-aware Pin/Star buttons, contextual dropdown, view-specific bulk action buttons, `'trash'` empty state variant.
- [x] **Phase 4: 4 dedicated route files** — `/favorites`, `/archive`, `/trash` (each with breadcrumb, head, stripSearchParams, validateSearch). `notes/index.tsx` thinned to wrapper. `$noteId.tsx` with `from` search param.
- [x] **Phase 5: Sidebar links** — Updated `nav-main.tsx` links to `/favorites`, `/archive`, `/trash`. Simplified active matching. 30+ i18n keys to EN and VI.
- [x] **Phase 6: Verification** — `bun --bun install`, `bun --bun check` pass (0 errors, 10 pre-existing warnings)

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
- Paraglide message keys must be added to both en.json and vi.json simultaneously
- FAB auto-hide via `scale-0 pointer-events-none opacity-0` is smoother than conditional rendering
- URL-driven views work well with TanStack Router's `validateSearch` + `stripSearchParams` pattern
- Backend uses 0-indexed pagination; FE stores 1-indexed in URL with page - 1 conversion in the API layer
- Bulk Pin/Tag remain no-ops (no BE endpoint exists)

## Blockers / Risks

- None

## Decisions Made

- **View state**: URL search params (archived, trashed, favorite) rather than local state
- **Page conversion**: FE stores 1-indexed page in URL, converts to 0-indexed at API call time
- **ViewMode**: `NoteViewMode` type (`'active' | 'favorites' | 'archive' | 'trash'`) maps to specific query param sets
- **Bulk Pin/Tag**: No-op buttons (no backend endpoint), kept in UI for future implementation
- **Confirm dialogs**: Added for destructive bulk actions (delete permanent, trash)

## Evidence of Completion (feat-031)

- [x] All 6 phases implemented and verified
- [x] `bun --bun install` passes
- [x] `bun --bun check` passes (0 errors, 10 pre-existing warnings)
- [x] Repository restartable from `./init.sh`

## Notes for Next Session

- Remaining features: AI Tab Completion (feat-023), Voice-to-Text (feat-024), PDF Export (feat-027), Quick Note Dialog (feat-028)
- Tag filter is hardcoded — wire to real tag data when tags API is ready
- View toggle state is local — promote to URL search param if persistence needed
