# Session Progress Log

## Current State

**Last Updated:** 2026-07-31
**Session ID:** command-palette-keyboard-i18n-prefill
**Active Feature:** Command palette keyboard handling + i18n cleanup + /notes/create title prefill

## Status

### What's Done (command palette refinements)

- [x] **`useKeyBinding` capture option** — `UseKeyBindingOptions.capture?: boolean` passed to `addEventListener`/`removeEventListener`; enables capture-phase interception (needed to beat base-ui's document-level Escape listener)
- [x] **Command palette `onKeyDown` → hook** — deleted `handleKeyDown` in `command-palette.tsx`; replaced with two `useKeyBinding` calls: (A) `arrowdown`/`arrowup`/`enter` with `{ enabled: isOpen && !commandOutput, ignoreWhenTyping: false }`; (B) `escape`/`backspace` with `{ enabled: isOpen && !!commandOutput, capture: true }` calling `e.stopPropagation()` to go back from output view without closing the dialog
- [x] **Escape/Backspace back-navigation restored** — verified base-ui `useDismiss.js` `closeOnEscapeKeyDown` does NOT check `defaultPrevented`; window-capture + `stopPropagation` prevents dialog close while returning to search. Restores behavior promised by `command_palette_help_esc_tip_*`
- [x] **Search input cleaned** — removed `onKeyDown` prop + `ReactKeyboardEvent` import from `command-palette-search-input.tsx`
- [x] **Hardcoded strings → i18n** — 5 strings replaced: create-with-title / create-empty subtitles, `"Create note {title}"`, view-all title/subtitle. Empty-title case reuses existing `command_palette_title_create_note`
- [x] **Stale key cleanup** — removed 9 keys from en.json (`title_create`, `subtitle_create`, `toast_create_success`, `toast_create_error`, `unknown_error`, `note_body`, `create_fallback_title`, `subtitle_create_note`, `title_go_copilot_short`) and 8 from vi.json (title_go_copilot_short never existed there); added 5 new keys (`create_title_with_title`, `create_subtitle_with_title`, `create_subtitle_empty`, `view_all_title`, `view_all_subtitle`) to BOTH files → en/vi parity verified programmatically
- [x] **`/notes/create?title=...` prefill** — added `validateSearch: z.object({ title: z.string().optional() })` to `create.tsx` Route + `defaultValues.title: Route.useSearch().title ?? ''`
- [x] **Verification** — `bun --bun install` (auto `generate-translation`) ✓, `bun --bun check` ✓ (0 errors, pre-existing warnings only), `tsc -b` ✓ (exit 0), en/vi key parity ✓
- [x] **Scope guard** — reverted prettier's auto-fix of `error-page.tsx` (pre-existing non-conforming file, not part of this work); `resizable.tsx` working-tree change is prior uncommitted work, left untouched

### What's Done (i18n reapplication after command palette restyle)

- [x] **Restyle reverted i18n** — the palette UI restyle removed `m` imports and re-hardcoded English strings in all 7 component files
- [x] **command-palette.tsx** — restored `m` import; all slash command subtitles, output titles, theme toasts, create-note fallback title/body/toasts, static command titles/subtitles, logout confirm now via `m.*()`; new `command_palette_subtitle_toggle_theme` key for static "Switch to {mode} mode" (distinct from slash `/theme` subtitle)
- [x] **Views re-i18n-ified** — help-view (cheatsheet title, split Esc-tip prefix/suffix keeping `<Kbd>` styling), stats-view (title, 4 stat labels, tags count, no-tags fallback), notes-view (title with count, empty state, untitled fallback, new `command_palette_notes_updated` "Updated {date}")
- [x] **Sub-components** — output (Back button), search-input (placeholder), search-results (split no-results prefix preserving highlighted search term span, split `/help` hint preserving `<code>` styling, CMD badge, Select label)
- [x] **Message cleanup** — updated 25+ existing key values to match new restyled wording; removed 16 dead keys (`command_palette_tip_back`, `_notes_id`, `_notes_open`, `_notes_untitled`, legacy plain keys `help/theme/stats/notes/create/tips/cmd_mode/cheat_sheet/navigate/no_results/type_help`, `_title_go_copilot_short` kept in EN); added new keys (prefix/suffix splits, `_subtitle_toggle_theme`, `_notes_updated`, `_cmd_badge`, `_select`) in BOTH en.json and vi.json
- [x] **Pomodoro timer deprecated** — user confirmed deprecated; excluded permanently (see feature_list.json feat-010)
- [x] **Verification** — `bun run generate-translation` ✓, `bun --bun check` ✓ (0 errors, pre-existing warnings only), `bun run build` (tsc -b + vite) ✓

### What's Done (previous session — i18n-hardcoded-cleanup)

- [x] **Audit** — scanned `src/routes/`, `src/features/` (excluding deprecated/focus), `src/components/shared/`, `src/components/layouts/` for hardcoded user-facing text
- [x] **~130 strings migrated** across 20+ files; all new keys added to both `messages/en.json` and `messages/vi.json`
- [x] **error-page.tsx** — full Vietnamese → i18n (ERROR_CONFIG now returns message functions, toasts, buttons, tech-details copy)
- [x] **command-palette/** — 7 files i18n-ified (superseded by this session's reapplication)
- [x] **lexical editor** — `lexical-toolbar.tsx` (14 tooltips), `lexical-shortcuts-dialog.tsx` (20+ strings), `lexical-editor.tsx` default placeholder
- [x] **app-top-header.tsx** — locale labels now use `header_language_*` keys, search placeholder, tooltips, aria-labels, sr-only
- [x] **Small files** — auth placeholders/OAuth labels, chat (agent name/desc, web-search toggle, model selector, file-attach toasts), settings tabs, tags sort options, notes view desc + mock tag chips, search-input placeholder, nav-user fallbacks, profile-page fallbacks
- [x] **Bonus** — `confirm-provider.tsx` Vietnamese fallbacks, `notes/schemas.ts` Zod message, `notes/services.ts` export fallback title
- [x] **Pomodoro timer excluded** per user request (still hardcoded English: Focus/Play/Pause/Reset)
- [x] **Verification** — `bun --bun install` ✓, `bun --bun check` ✓ (0 errors, pre-existing warnings only), `bun run build` (tsc -b + vite) ✓

### What's In Progress

- (none)

### What's Next

Remaining features from `feature_list.json` (not-started):
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
- base-ui `useDismiss` Escape handler (`closeOnEscapeKeyDown`) does NOT check `event.defaultPrevented` — it closes the dialog unconditionally via a document-level bubble listener. To override it (e.g. Escape = "go back" inside command output), bind in the capture phase on window and call `stopPropagation()`

## Blockers / Risks

- None

## Decisions Made

- **View state**: URL search params (archived, trashed, favorite) rather than local state
- **Page conversion**: FE stores 1-indexed page in URL, converts to 0-indexed at API call time
- **ViewMode**: `NoteViewMode` type (`'active' | 'favorites' | 'archive' | 'trash'`) maps to specific query param sets
- **Bulk Pin/Tag**: No-op buttons (no backend endpoint), kept in UI for future implementation
- **Confirm dialogs**: Added for destructive bulk actions (delete permanent, trash)
- **Command palette keyboard**: two mutually-exclusive `useKeyBinding` calls (search-view arrows/enter; output-view escape/backspace) instead of one `onKeyDown` — no guard branches needed, arrows no longer blocked in output view
- **Escape override**: window-capture + `stopPropagation()` (preventDefault alone is ignored by base-ui's dialog Escape handling)

## Evidence of Completion (feat-031)

- [x] All 6 phases implemented and verified
- [x] `bun --bun install` passes
- [x] `bun --bun check` passes (0 errors, 10 pre-existing warnings)
- [x] Repository restartable from `./init.sh`

## Notes for Next Session

- Remaining features: AI Tab Completion (feat-023), Voice-to-Text (feat-024), PDF Export (feat-027), Quick Note Dialog (feat-028)
- Tag filter is hardcoded — wire to real tag data when tags API is ready
- View toggle state is local — promote to URL search param if persistence needed
