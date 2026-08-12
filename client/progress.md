# Session Progress Log

## Current State

**Last Updated:** 2026-08-12
**Session ID:** remappable-shortcuts
**Active Feature:** feat-049 — single-source remappable keyboard shortcuts + bug-fix batch — done (verified lint/tsc/build; artifacts updated)

## Status

### What's Done (feat-049 — Remappable Keyboard Shortcuts + Bug-Fix Batch)

- [x] **Single source of truth** — `src/config/keyboard-shortcuts.ts` is the only shortcut registry (global + 12 editor + sidebar toggles). `src/store/shortcuts-store.ts` (NEW): zustand persist `'synapse-shortcuts'` v1, `partialize: { overrides }`, `setBinding(id, combos|null)` (null = disable), `resetBinding`, `resetAll`. `src/hooks/use-shortcut.ts` (NEW): reactive `{ combos, display }` per `ShortcutId` via `getEffectiveCombos(id, overrides)`. Helpers: `normalizeCombo` (first meta/ctrl → `mod`), `combosToDisplay` (uses combos[0]), `findShortcutConflict` (mod-expanded compare, skips targetId, one-namespace rule → `mod+b` assignment to editor-bold is rejected since toggle-left-sidebar already owns it).
- [x] **Global bindings reactive** — `app-global-keybinds.tsx`: go-to-notes (`mod+shift+n`, replaces old quick-new-note N), focus-search, show-keyboard-shortcuts. `_app/route.tsx` `toggle-right-sidebar` + `sidebar.tsx` `toggle-left-sidebar` (removed built-in `SIDEBAR_KEYBOARD_SHORTCUT='b'`/hardcoded effect) now store-driven. `command-palette.tsx` uses `useShortcut('command-palette')`; palette arrow/enter binding got `capture: true` (was being intercepted by the window-sidebar listener). `useKeyboardShortcut` now mod-expands `allowWhenTyping`.
- [x] **Editor keymap registry-driven** — `lexical-keyboard-shortcuts.tsx` rebuilt: `EDITOR_SHORTCUT_IDS` (12 ids, `satisfies readonly ShortcutId[]`), `actionCombos` from `getEffectiveCombos(id, overrides)`, combos+dispatcher in refs, `matchesCombo` (expandModKey), command `COMMAND_PRIORITY_LOW`. Matching shifted from `event.code` to `getKeyCombo`/`event.key` — known accepted behavior shift. Exported helpers (`formatHeadingBlock`/`formatParagraphBlock`/`formatQuoteBlock`, `HeadingTagType`) preserved.
- [x] **Form save shortcut shared** — `use-form-save-shortcut.ts` (NEW): binds `save-note` combos to `form.handleSubmit(onSubmit)` with `allowWhenTyping: save-note.combos`, `enabled` option. Wired into `use-note-create.ts`/`use-note-details.ts` (replaces hardcoded ctrl+s/meta+s), `companion-settings-page.tsx` (skips submit when not dirty), conversation rename dialog in `conversation-list-item.tsx` (gated on `isRenameOpen`, placed after `handleRenameSubmit` for TDZ; save button also disabled `|| !form.formState.isDirty`).
- [x] **Settings > Shortcuts tab** — `SETTINGS_TABS = ['general','companion','shortcuts']` + `settings.tsx` wiring + head title. `shortcuts-settings-page.tsx` (sections, editor sub-groups, Reset all disabled when no overrides) + `shortcut-remap-row.tsx` (Change/None/Reset buttons; capture Input autoFocus readOnly; **modifier required** — bare keys like `/` for focus-search can't be captured; Escape cancels; modifier-only keys ignored; conflict → stay capturing + inline error; success → `setBinding(id, [normalized])`; `mod` shown as ⌘/Ctrl via `useIsMac`). `keyboard-shortcuts-list.tsx` dialog now shows live effective combos + `settings_shortcuts_disabled` when empty.
- [x] **Bug fixes bundled** — agent-mode `/chat` guard: `readPersistedLayoutMode()` (in `settings-store.ts`, reads `localStorage['synapse-settings'].state.layoutMode`) + `beforeLoad` redirect to `/notes` in `chat.tsx` + `chat.$conversationId.tsx`. `use-go-to-companion.ts` (NEW): chat mode → navigate `/chat`, agent mode → `setRightSidebarOpen(true)`; used by command palette + error page. `/create` prefill: `validateSearch` `content` (was `title`), `useNoteCreate` gained `initialContent`. Empty companion-save toast → `settings_page_toast_saved` / `settings_page_save_failed`.
- [x] **i18n (en+vi)** — `keyboard_shortcuts_new_note` → `keyboard_shortcuts_go_to_notes`; added `settings_page_tab_shortcuts`, `settings_shortcuts_{description,reset_all,remap,disable,reset,capturing,cancel,disabled,conflict}`. `bun run generate-translation` ✓.
- [x] **Verification** — `./init.sh` ✓, `bun --bun check` ✓ (prettier fixed formatting; 2 pre-existing warnings untouched), `bunx tsc -b` ✓, `bun --bun run build` ✓ (vite v8.1.5, 7003 modules). Pre-existing staged changes (deprecated renames, bun.lock, package.json, shared/index.ts, tags.tsx) left as-is; no commit (user manages).
- [ ] **Known notes** — (1) editor shortcut matching now uses `event.key` (lowercase) via `getKeyCombo`, not `event.code` — verify in manual smoke that all editor bindings still fire, especially non-latin layouts. (2) `mod+b` is intentionally overloaded (editor-bold in editor scope, toggle-left-sidebar in global scope, different namespaces) — remapping editor-bold to `mod+b` in Settings is blocked by the same-namespace conflict rule. (3) bare-key shortcuts (e.g. focus-search `/`) cannot be re-captured (modifier required) but can be reset to default. (4) `getShortcut` export kept but unused (dead code, deliberately). (5) right-sidebar inner SidebarProvider also registers `toggle-left-sidebar` (same as pre-existing double-registration).

### What's Done (bug-fix pass — chat navigation + older-message loading)

Three bugs fixed (2026-08-11, on top of staged feat-044..047):

- [x] **(B1) Chat-mode conversation click did nothing** — `nav-companion.tsx` `handleSelectConversation` only set the store + opened the right sidebar, and no `/chat/:conversationId` route existed; in chat mode the right panel is collapsed so clicks were invisible. Fix: new route `src/routes/_app/chat.$conversationId.tsx` (`createFileRoute('/_app/chat/$conversationId')`, effect `setActiveConversationId(conversationId)`), and in chat mode `handleSelectConversation` now also `navigate({ to: '/chat/$conversationId', params: { conversationId } })`. Agent mode unchanged (sidebar-only, per user).
- [x] **(B2) `/chat` = new chat** — `src/routes/_app/chat.tsx` gains a mount effect `setActiveConversationId(null)`; `handleNewChat` navigates to `/chat` in chat mode (agent mode keeps sidebar-only behavior). `useNavigate` added.
- [x] **(B3) Scroll-to-top spinner flashed but older messages never appeared** — root cause: `@ai-sdk/react@4.0.50` `useChat` seeds `messages` **once** in a `useRef` (`new Chat(chatOptions)` only recreated when `id` changes); growing `data.pages` recomputed the `messages` prop but ChatBot ignored it. Fix in `chat-bot.tsx`: renamed prop `initialMessages` → `messages` (live full list) and added a `useLayoutEffect` that diffs `chat.messages` vs `loadedMessages` and prepends missing older ones via `chat.setMessages((prev) => [...older, ...prev])` (layout effect guarantees the prepend commits before `ConversationLoadOlder`'s passive-effect scroll-delta restore). Render uses `liveMessages` (chat state). Also removed the mount-time `handleScroll()` call in `ConversationLoadOlder` so `atTop` only becomes true on real user scrolls (was causing spurious fetch chaining on open).
- [x] **Verification** — `bun --bun generate-routes` ✓ (routeTree.gen.ts registers `/chat/$conversationId` under `/chat`), `bun --bun tsc -b` ✓, `bun --bun check` ✓ (exit 0, only the 2 pre-existing warnings), `bun --bun run build` ✓. Prettier churn on unrelated files reverted (pure LF/CRLF line-ending noise; `app-breadcrumb.tsx` was a cosmetic reformat).
- [x] **Artifacts** — `feature_list.json` feat-048 added; `progress.md` updated; no commit (user manages).
- [ ] **Known note** — end-to-end scroll-up pagination still needs a manual smoke test with the ai-service up (no local DB run this session); logic verified against installed `@ai-sdk/react@4.0.50` + `ai@7.0.47` sources.


### What's Done (feat-044 — Layout switching: Chat vs Agent workspaces)

- [x] **Types** — `LayoutMode = 'agent' | 'chat'` (was `'servant' | 'chat'`) in `src/components/layouts/types.ts`.
- [x] **settings-store.ts** — persisted under `'synapse-settings'` with `version: 1` + `migrate` mapping `'servant'` → `'agent'`; `setLayoutMode('agent')` now auto-opens the right sidebar.
- [x] **route.tsx (rewritten)** — ResizablePanel right panel driven by mode (chat = collapsed/hidden panel, agent = expanded with right sidebar); mobile branch via `useIsMobile` → Sheet instead of ResizablePanel; `transition-[flex-grow,flex-basis] duration-300 ease-in-out`; `toggleRightSidebar` switches chat → agent; effect syncs panel collapse/expand with sidebar state.
- [x] **app-top-header.tsx (rewritten)** — Base-UI `ToggleGroup` mode switch (array-based `value={[layoutMode]}`, read `values?.[0]`); right-sidebar toggle hidden in chat mode; `aria-pressed` toggle; `@container/top-header` container queries.
- [x] **app-right-sidebar.tsx** — made container-agnostic (plain divs, no `useIsMobile`).
- [x] **centered prop** — threaded `chat-page.tsx` → `companion-chat.tsx` → `chat-bot.tsx` (`mx-auto w-full max-w-6xl` on ConversationContent + input wrapper).
- [x] **i18n** — `sidebar_mode_agent(_desc)` renamed from `sidebar_mode_servant`; new `header_mode_toggle_aria`.
- [x] **Verification** — `bun --bun check` ✓, `bun --bun tsc -b` ✓, `bun --bun run build` ✓.

### What's Done (feat-045 — Responsive top header + collapsing breadcrumb)

- [x] **New `src/components/layouts/constants.ts`** — `HEADER_BREADCRUMB_COLLAPSE_WIDTH=640`, `HEADER_SEARCH_COMPACT_WIDTH=520`, `HEADER_SEARCH_ICON_ONLY_WIDTH=380`.
- [x] **New `src/hooks/use-element-width.ts`** — ResizeObserver-based width hook (no sync `setState` in effect body — react-hooks clean).
- [x] **app-breadcrumb.tsx** — when `width <= 640 && crumbs.length > 2`, collapses to `[Root] / [⋯ DropdownMenu] / [Active]` (all crumbs listed in dropdown). `BreadcrumbItemData` type alias avoids clash with the UI `BreadcrumbItem` component.
- [x] **app-top-header.tsx** — toggle labels + search label/kbd hidden via container-query variants `@min-[520px]/top-header:inline`; actions row `gap-2` + `min-w-0`.
- [x] **i18n** — new `header_breadcrumb_more`.
- [x] **Verification** — `bun --bun check` ✓, `bun --bun tsc -b` ✓.

### What's Done (feat-046 — Chat enhancements: first-click fix, pagination, favorites filter)

- [x] **(C1) First-click fix** — `companion-chat.tsx` gates `ChatBot` mount while `isLoadingConversation` (spinner overlay only); mounts only after settle, so the first click never hits a stale empty-message path.
- [x] **(C2) Backend pagination** — `services/ai`: `messagesQuerySchema` (limit default 15 / max 100, offset default 0, both `z.coerce.number()`), repository `findMessagesByConversationIdPage` (DESC LIMIT/OFFSET), `loadMessagesPage` reverses to chronological, route `GET /:id/messages` uses query validator. Unpaged `loadHistory` kept for the AI request context (`chat/services.ts`).
- [x] **(C2) Client pagination** — `api.ts` query `{ limit?, offset? }`; `useGetConversationMessagesInfiniteQuery` (`MESSAGE_PAGE_SIZE=15`, `initialPageParam 0`, `getNextPageParam = lastPage.length === 15 ? sum of lengths : undefined`); `companion-chat.tsx` flattens `[...pages].reverse().flat()` for chronological order.
- [x] **(C2) ChatBot handle** — `forwardRef<ChatBotHandle>` with `prependMessages` (via `chat.setMessages`, since `ai@7.0.47` has no `prependMessages`) + `sendText`. `ConversationLoadOlder` scroll-top listener (`scrollRef.scrollTop <= 1`), anchor restore (`scrollTop += scrollHeight - prevHeight`), top spinner pill.
- [x] **(C3) Recents filter** — `nav-companion.tsx` `recentConversations = conversations.filter((c) => !c.favorited)`.
- [x] **Verification** — `bun --bun check` ✓ (client + services/ai scoped to conversation/*), `bun --bun tsc -b` ✓, build ✓.

### What's Done (feat-047 — AI Companion: context-aware right sidebar)

- [x] **`src/store/companion-context-store.ts` (NEW)** — `CompanionActiveDocument { id, title, content }`, `CompanionEditorBridge { insert, replace }`, `setActiveDocument` / `setEditorBridge`.
- [x] **`src/components/shared/editor/companion-bridge-plugin.tsx` (NEW)** — mounted in `lexical-editor.tsx`; `insert` via `$generateNodesFromMarkdownString(md, CUSTOM_TRANSFORMERS)` + `$getSelection().insertNodes` (fallback root.append); `replace` via `$getRoot().clear()` + `$convertFromMarkdownString`.
- [x] **`src/routes/_app/notes/$noteId.tsx`** — effect registers `activeDocument` from `watchTitle` / `watchedContent` / `useParams` noteId; cleared on unmount.
- [x] **`src/features/companion/config/companion-prompts.ts` (NEW)** — `QUICK_ACTION_IDS` + `buildQuickActionPrompt` (summarize / translate / polish / ask); 4000-char truncate; translate targets `getLocale()`.
- [x] **UI** — `companion-context-bar.tsx` (title + char count + copy button), `companion-quick-actions.tsx` (4 buttons → `chatRef.current.sendText`), `chat-bot.tsx` `MessageAssistantActions` (Insert/Replace/Copy via `editorBridge`, rendered only when a bridge is registered).
- [x] **`app-right-sidebar.tsx`** — wires `chatRef` + ContextBar + QuickActions above `CompanionChat`.
- [x] **i18n** — `companion_context_untitled`, `companion_context_chars({count})`, `companion_context_copy`, `companion_context_copied`, `companion_quick_summarize/translate/polish/ask`, `companion_message_insert/replace/copy/copied` (en/vi).
- [x] **Verification** — `bun --bun check` ✓, `bun --bun tsc -b` ✓, build ✓ (6994 modules).

### What's Done (feat-043 — conversation actions: favorite, rename, delete)

- [x] **Backend (services/ai)** — three new routes on the conversation router: `PATCH /api/v1/ai/conversations/:id` (rename via `renameConversationSchema`, title trim 1–100), `PATCH /api/v1/ai/conversations/:id/favorite` (`favoriteConversationSchema` `{ favorited: boolean }`), `DELETE /api/v1/ai/conversations/:id`. Service: `onDelete` cascade deletes the conversation's messages, `favorited` threaded through `Conversation` type + list query.
- [x] **Client API surface** — `CompanionFetchRouter` gains the 3 endpoints; `src/features/companion/schemas.ts` gains `renameConversationSchema` (min(1) `validation_title_required` / max(100) `validation_title_max`) and `favoriteConversationSchema`; `CompanionConversation` type gains `favorited`.
- [x] **Mutation hooks** — `use-companion-conversation.ts` gains `useRenameConversationMutation`, `useDeleteConversationMutation`, `useToggleConversationFavoriteMutation` (mirrors `use-note-mutation.ts` InferResponseType/InferRequestType pattern; invalidate `['companion-conversations']`; per-action toasts). Also added `useGetConversationsQuery` (was previously defined in a chat feature file — nav-companion needed it; single source).
- [x] **ConversationListItem** (new, `src/features/companion/components/conversation-list-item.tsx`) — one sidebar row + Base UI `DropdownMenu` (via `render` prop on `SidebarMenuAction showOnHover`): star/unstar (amber StarIcon when favorited), rename (RHF + zod rename dialog, `standardSchemaResolver`, Field/Input, Save/Cancel), delete (AlertDialog confirm → onDeleted callback). No `useEffect` (form reset on dialog open via `onOpenChange`).
- [x] **nav-companion.tsx** — Recents section renders `ConversationListItem` per conversation; Favorites section now populated (favorited only, empty state `chat_conversation_favorites_empty`); `handleConversationDeleted` clears `activeConversationId` in the store when the active conversation is deleted.
- [x] **i18n (20 new keys en/vi)** — `chat_conversation_action_star|unstar|menu|rename|delete`, `chat_conversation_rename_title|placeholder|save|cancel`, `chat_conversation_delete_title|description|confirm`, `chat_conversation_toast_renamed|deleted|starred|unstarred|failed`, `chat_conversation_favorites_empty`, `validation_title_required`.
- [x] **Verification** — `generate-translation` OK; `tsc -b` clean; oxlint + eslint clean on all touched files; prettier all unchanged (check ran `--fix` only on touched files; pre-existing warnings in companion-chat.tsx untouched).
- [x] **Artifacts** — `feature_list.json` feat-043 done (43 feats, valid JSON); no commit (user manages).
- [ ] **Known note** — shared `validation_title_max` says "at most 200" but the conversation schema caps at 100 (server parity); key text is shared with notes (200) so left untouched.


### What's Done (feat-042 — schema validation i18n + favorites empty-state keys)

- [x] **Fixed translation (build break)** — `notes-list-empty.tsx` referenced `notes_page_no_favorites` / `notes_page_no_favorites_desc` which never existed. Added: en "No favorite notes" / "Star notes to keep them close.", vi "Không có ghi chú yêu thích" / "Đánh dấu sao ghi chú để xem chúng ở đây." (placed after the archived pair).
- [x] **Schema messages i18n (zod v4.4.3 `{ message }` params)** — all user-input/query schemas now use Paraglide messages instead of zod's default English:
  - `src/schemas/query.ts` — pagination: `page`/`pageSize` invalid-type/int/positive → `validation_page_invalid` / `validation_page_size_invalid`, `pageSize` max → `validation_page_size_max`.
  - `src/features/notes/schemas.ts` — `noteIdParamSchema.id` min → `validation_id_required`; `noteInputSchema` content max 1500 → `validation_content_max`, title max 200 → `validation_title_max`; `bulkNoteActionsSchema.ids` min → `validation_ids_required` (element min → `validation_id_required`); `generateNoteTitleSchema.content` min → `validation_content_required`; `notesQueryParamsSchema.sort` enum → `validation_sort_invalid`.
  - `src/features/companion/schemas.ts` — `conversationIdParam.id` min → `validation_id_required`.
  - `src/features/settings/schemas.ts` — `tab` enum → `validation_tab_invalid`.
- [x] **New i18n (12 keys × en/vi)** — `notes_page_no_favorites{,desc}`, `validation_page_invalid`, `validation_page_size_invalid`, `validation_page_size_max`, `validation_id_required`, `validation_content_required`, `validation_content_max`, `validation_title_max`, `validation_ids_required`, `validation_sort_invalid`, `validation_tab_invalid`. 600/600 keys, parity 0/0.
- [x] **Verification** — `generate-translation` ✓ (600/600, parity 0/0), `check` ✓ exit 0 (pre-existing warnings only). `build`: ALL translation-related errors gone (notes-list-empty, schemas). The 12 remaining structural errors from the user's refactor (nav-main href, 11 deprecated notes files) were fixed by the USER (see "Refactor breakage resolved" below).
- [x] **Artifacts** — `feature_list.json` feat-042 done (42 feats, valid JSON); no commit (user manages).


### What's Done (feat-041 — conversation list in sidebar + store-driven chat page)

- [x] **NavCompanion conversation list** — under the existing "AI Companion" group (mode-switch untouched): New Chat button (MessageCirclePlusIcon + `sidebar_new_chat`), "Recents" section (3-row `Skeleton` while loading, empty text `chat_conversations_empty`, per-conversation `SidebarMenuButton` with truncate title / `chat_conversation_untitled` fallback / active highlight, click → `setActiveConversationId` + navigate `/chat`), "Favorites" section label with empty placeholder (favorites grouping later, per user). Removed the commented-out `companionItems` block.
- [x] **Zustand store** — new `src/store/companion-store.ts`: `activeConversationId: string | null` + `setActiveConversationId` (no persist; pattern per settings-store).
- [x] **ChatPage rework** (was the "wrong implementation"): old left rail + local state + `handleSelectConversation`/`handleNewChat` deleted. Now: `activeConversationId` from store; `null` → ChatBot with no initialMessages (empty conversation per spec); id → `useGetConversationMessagesQuery(id)` (hook now `string | null` + `enabled: id !== null`); while loading → absolute spinner overlay (`Spinner size-6`, `bg-background/60`, `role=status`) + ChatBot `disabled`; `key={activeConversationId ?? 'new-chat'}` remount preserves load semantics; `onConversationId` → set store + invalidate `['companion-conversations']` so Recents refreshes after first message.
- [x] **ChatBot `disabled` prop** — threads to `PromptInputTextarea`, `PromptInputSubmit` (`disabled || isSubmitDisabled`), `PromptInputActionMenuTrigger`, web-search `PromptInputButton`, `SpeechInput` via conditional spread `{...(disabled ? { disabled: true } : {})}` (SpeechInput spreads `...props` last and would clobber its internal `isDisabled` if passed `undefined`).
- [x] **Stale imports fixed** — `routes/_app/chat.tsx` and `components/layouts/app-right-sidebar.tsx` now import from `@/features/companion/...` (old `@/features/chat` paths were deleted in the user's restructure).
- [x] **i18n** — new `sidebar_recents` ("Recents"/"Gần đây"); reused `sidebar_new_chat`, `sidebar_favorites`, `chat_conversations_empty`, `chat_conversation_untitled`. 588 keys each, parity 0/0.
- [x] **Verification** — `generate-translation` ✓ (588/588, parity 0/0), `check` ✓ exit 0 (pre-existing warnings only). `build`: my files typecheck clean at the time; the 13 pre-existing user-refactor errors (nav-main hrefs, 11 deprecated notes files, notes-list-empty keys) were later resolved by the user + feat-042 keys (see below).
- [x] **Artifacts** — `feature_list.json` feat-041 done (41 feats, valid JSON); no commit (user manages).

### Refactor breakage resolved by user (2026-08-08, before commit)

- `nav-main.tsx` hrefs updated to the new routes (`/notes/favorites`, `/notes/archive`, `/notes/trash`) AND `routeTree.gen.ts` regenerated to include `/notes/archive` (matches the renamed route file `notes/archive.tsx`).
- Deprecated notes files (`note-batch-actions.tsx`, `note-form.tsx`, `quick-create-note-dialog.tsx`, `quick-edit-note-dialog.tsx`, `template-selector.tsx`) — broken imports/references (deleted `@/features/notes/fetch`, removed schema exports, deleted `@/features/chat/lib/companion-config`) commented out; files kept as reference-only and compile.
- Verified: working tree == staged (95 files, nothing unstaged); no remaining `companion-config`/`noteFormSchema`/`NoteFormValues` references in deprecated files. Build status: user fixed before commit; no build re-run after their fix (next session should run `./init.sh`/`bun --bun run build` to confirm).


### What's Done (feat-040 — bulk actions: toasts + majority rule + empty-trash clear)

- [x] **Action-aware bulk toasts** — `use-note-mutation.ts`: `useBulkActionsMutation` now toasts per-action via literal-switch `getBulkActionSuccessMessage(action)` (PIN→pinned, UNPIN→unpinned, FAVORITE→favorited, UNFAVORITE→unfavorited, ARCHIVE→archived, UNARCHIVE→unarchived, TRASH→trashed, RESTORE→restored, DELETE_PERMANENT→deleted); error → `notes_page_toast_update_failed`. Previously every bulk action toasted "Trash emptied"/trash_failed. Follows the requested hook format (onSuccess invalidate + toast, onError toast, mutationFn). Mirrors `getTranslatedAuthErrorMessage` pattern (RULES.md literal calls).
- [x] **Majority rule in bulk bar** — `notes-bulk-actions.tsx` restructured: props now `notes` + `selectedIds` + single `onBulkAction(action)` (+ viewMode/onClearSelection). Computes strict majority over selected page notes: `pinnedCount > half` → Unpin (`UNPIN`) else Pin; same for Favorited→Unfavorite/Favorite and Archived→Unarchive/Archive (tie → positive action per user choice). Favorites view automatically yields "Unfavorite", archive view "Unarchive". Backend `UNPIN`/`UNFAVORITE` actions were already supported but never sent. Trash/restore unified through bulk endpoint (was per-note loop) — `handleBulkAction` with DELETE_PERMANENT confirmation dialog preserved. Removed per-call onError toasts + "TODO: Toast here" comments + dead `invalidateNotes`/`queryClient`.
- [x] **Empty-trash selection clear (bug)** — `handleEmptyTrash` in notes-view-page.tsx now clears the multi-select before delegating to `onEmptyTrash` (mutation lives in trash route, selection lived in NotesViewPage).
- [x] **i18n** — new `notes_bulk_unpin` ("Unpin"/"Bỏ ghim"), `notes_bulk_unfavorite` ("Unfavorite"/"Bỏ yêu thích"); 587 keys each, parity 0/0. All toast keys already existed.
- [x] **Verification** — `bun --bun run generate-translation` ✓ (587/587, parity 0/0), `bun --bun check` ✓ exit 0 (pre-existing warnings only), `bun --bun run build` (tsc -b + vite) ✓.
- [x] **Artifacts** — `feature_list.json` feat-040 done (40 feats, valid JSON); no commit (user manages).
- [ ] **Known limitation** — majority counts are computed from the current page's notes only; selections spanning multiple pages don't contribute to the count (defaults to positive action). Acceptable; note if cross-page majority is needed later.

### What's Done (feat-039 — Settings page i18n + option label fix + orphan cleanup)

- [x] **companion-settings-page.tsx** — all 13 hardcoded Vietnamese strings replaced with `m.*()`: bot name label/placeholder, response length label/placeholder, language label/placeholder, use-emoji label + description, preset label/placeholder, custom instructions label/placeholder, save button (`settings_page_companion_save`). Reused orphaned keys where wording matched; updated 3 key values to match the current UI (bot_name → "Assistant name"/"Tên trợ lý", use_emoji → "Use emoji"/"Sử dụng emoji", preset → "Response style"/"Phong cách phản hồi", companion_save → "Save"/"Lưu").
- [x] **constants.ts bug fix** — response-length options (short/balanced/detailed) and language options (vi/en/auto) all pointed at the SAME key (`settings_companion_response_length` / `settings_companion_language`) → dropdowns rendered the identical label 3×. Refactored to RULES.md-compliant shape: three option Maps deleted, config stays data-only (arrays `COMPANION_SETTINGS_RESPONSE_LENGTH/PRESETS/LANGUAGES`), labels resolved via literal-switch getters `getResponseLengthLabel` / `getPresetLabel` / `getLanguageLabel` (default fallback per `getSortOptionLabel`). Page renders options by mapping arrays + getters.
- [x] **use-companion-settings.ts** — toasts now i18n'd: `toast.success(m.settings_page_toast_saved())`, `toast.error(m.settings_page_save_failed())` (both keys already existed).
- [x] **settings.tsx route** — `createTitle('Settings')` → `createTitle(m.settings_page_title())` (only route with a hardcoded title; all 8 others already used `m.*()`).
- [x] **New i18n keys (12 × en/vi)** — placeholders ×5 (`bot_name`, `response_length`, `language`, `preset`, `custom_instructions`), `use_emoji_desc`, `response_length_short|balanced|detailed`, `language_vi|en|auto`. Parity 585/585, 0/0.
- [x] **Orphan key cleanup (11 deleted)** — `settings_page_tab_templates`, `settings_page_companion_saving`, `settings_page_companion_persona_custom`, `settings_page_template_create`, `settings_page_toast_avatar_invalid`, `settings_companion_reset_default`, `settings_templates_predefined|edit_title|cancel|save|delete`. **KEPT** `settings_page_template_name/description/title_pattern/content` — deprecated `template-selector.tsx` still calls them (per "never delete deprecated-file references").
- [x] **Pre-existing build break fixed** — `chat-transport.ts:53` `...lastUserMessage.metadata` failed `tsc -b` (TS2698, `UIMessage.metadata?: unknown` in ai@7.0.47). Introduced by user commit 3315f0b (RAG→tool-calling), was never caught (build disabled in init.sh). Fixed with a type-only cast `...(lastUserMessage.metadata as Record<string, unknown> | undefined)` — zero runtime change.
- [x] **Verification** — `bun --bun run generate-translation` ✓ (585 keys en+vi, parity 0/0), `bun --bun check` ✓ exit 0 (pre-existing warnings only), `bun --bun run build` (tsc -b + vite) ✓ built in 21.51s.
- [x] **Artifacts** — `feature_list.json` feat-039 done (39 feats, valid JSON); no commit (user manages).

### What's Done (feat-038 — AI thinking indicator)

- [x] **In-conversation thinking bubble** — `chat-bot.tsx`: `isAwaitingResponse = isGenerating && (lastMessage?.role === 'user' || (lastMessage?.role === 'assistant' && lastMessage.parts.length === 0))`; renders an assistant `Message` + `MessageContent` + `<Shimmer duration={1}>{m.chat_thinking()}</Shimmer>` after the messages map. Covers the pre-first-chunk window (status 'submitted' / assistant message with zero parts); disappears automatically when the first part streams (Reasoning's own shimmer or streamed text takes over), on stop, or on error. Shimmer placed directly in MessageContent (MessageResponse requires `children: string` — Element not assignable). Auto-scroll via existing stick-to-bottom. New i18n `chat_thinking` en/vi ("Thinking…"/"Đang suy nghĩ…").
- [x] **Build unblock (deprecated file)** — `noteCreateFormSchema.content` is now `z.string().min(10).max(1500)` (user's own working-tree edit, 2026-08-02 22:01) → deprecated `quick-create-note-dialog.tsx` no longer compiles (NoteFormValues content optional vs required). Minimal fix: cast payload `createNote({ data: data as NoteCreateFormValues })` — deprecated reference-only file, no logic change. Flagged for user: quick-create silently never worked server-side anyway (content @NotBlank backend).
- [x] **Verification** — `bun --bun run generate-translation` ✓ (584 keys en+vi, parity 0/0), `bun --bun check` ✓ exit 0 (pre-existing warnings only), `bun --bun run build` (tsc -b + vite) ✓ built in 23.68s.
- [x] **Artifacts** — `feature_list.json` feat-038 done (38 feats, valid JSON); no commit (user manages).

### What's Done (feat-037 — model selector hidden + TanStack Query sweep + companion save fix)

- [x] **Hide model selector** — `chat-bot.tsx`: `const SHOW_MODEL_SELECTOR = false;` wraps the `<ModelSelector>` JSX block. Files untouched, all imports/state (`model`, `modelSelectorOpen`, `handleModelSelect`) and logic intact; selector hidden in both /chat page and right-sidebar ChatBot.
- [x] **Companion save fix (client side)** — root cause: `$fetch` has `throw: true` so backend errors throw; `use-ai-settings.ts update()` had NO catch → optimistic state stayed + `handleManualSave`'s `.then(toast)` became an unhandled rejection → 100% silent failure. Fixed: `use-ai-settings.ts` converted to `useQuery(['ai-settings'])` + `useMutation` (optimistic set, rollback to previous on error via onError, server value on success); `companion-tab.tsx` now toasts `settings_page_save_failed` on manual save / reset / debounced autosave failure and blocks save when `preset==='custom'` with empty `customInstructions` (mirrors backend `settingsSchema.refine`). New i18n `settings_page_save_failed` en/vi ("Failed to save settings"/"Không thể lưu cài đặt").
- [x] **TanStack Query sweep** — `use-conversations.ts` → `useQuery(['ai-conversations'])`, `refresh` = `invalidateQueries`; `chat-page.tsx` conversation-message load → `queryClient.fetchQuery(['ai-conversation-messages', id])` (exact remount/seed semantics preserved: await → setActiveConversationId+setActiveMessages+sessionKey++, catch → toast); `generateNoteTitle` → `useGenerateNoteTitleMutation` in use-note-mutation.ts, `create.tsx` + `$noteId.tsx` use `mutateAsync`, `isGeneratingTitle` derived from `mutation.isPending` (no more local useState). Documented exceptions: `chat-transport.ts` native fetch (AI SDK streaming transport), `prompt-input.tsx` blob-URL fetch (local FileReader conversion), `authClient` (better-auth library hook).
- [x] **Verification** — `bun --bun run generate-translation` ✓ (583 keys en+vi, parity 0/0), `bun --bun check` ✓ exit 0 (pre-existing warnings only), `bun --bun run build` (tsc -b + vite) ✓.
- [x] **Backend verify commands (for user, not run)** — settings save also depends on the staged ai-service being deployed: apply `services/ai` migration (`bunx drizzle-kit migrate` — new `user_ai_settings.bot_name` column exists only in migration `20260802061338_brainy_peter_parker`) and rebuild/restart the ai container; then `curl` GET `/api/v1/ai/settings` (expect `botName` in response) and PUT to confirm persistence.
- [x] **Artifacts** — `feature_list.json` feat-037 done (37 feats, valid JSON); no commit (user manages).

### What's Done (Copilot → Companion rename + i18n recovery)

- [x] **Companion rename (user request "change any copilot to companion")** — 22 i18n keys renamed in en.json AND vi.json (`settings_page_tab_copilot`→`settings_page_tab_companion`, `workspace_tab_copilot`, `error_page_btn_copilot`, `command_palette_title/subtitle_go_copilot`, `settings_page_general_copilot_alerts{,_desc}`, `settings_page_copilot_persona_custom/_saving/_save`, all 12 `settings_copilot_*`); values updated (`AI Copilot`→`AI Companion`, `Copilot Alerts`→`Companion Alerts`, `Ask AI Copilot`→`Ask AI Companion`, `Go to AI Copilot`→`Go to AI Companion`, vi: `Thông báo/Hỏi/Đến AI Copilot`→Companion, bare `Copilot`→`Companion`). Files renamed: `copilot-tab.tsx`→`companion-tab.tsx` (`CopilotTab`→`CompanionTab`), `chat/lib/copilot-config.ts`→`companion-config.ts`. Sources updated: settings-page.tsx (import, `CompanionTab`, `companionAlerts`, localStorage key `synapse_copilot_alerts`→`synapse_companion_alerts`, tab `value="companion"`), general-tab.tsx, templates-tab.tsx, deprecated/template-selector.tsx, command-palette.tsx (`go_companion`), error-page.tsx. Only remaining `[Cc]opilot` in src: `model-selector.tsx` `'github-copilot'` — technical model id, intentionally kept.
- [x] **INCIDENT 1 (recovered): global s→e corruption of messages files** — an inline PowerShell batch lost its quotes; a mangled replacement pair degraded to `('s','e')` and `String.Replace` hit EVERY lowercase `s` in both locale files ("settings"→"eettings"). Recovery: `src/paraglide/messages/*.js` were compiled pre-corruption and contain BOTH `en_*`/`vi_*` backtick strings, and `_index.js` preserves compile key order → both JSON files rebuilt programmatically from them; `$schema` re-added; 582 keys each, parity 0/0.
- [x] **INCIDENT 2 (user-caught, recovered): auth_error_code keys lowercased** — paraglide normalizes message keys to lowercase + numeric disambiguation suffix, so the paraglide-based recovery wrote `auth_error_code_user_not_found12` instead of HEAD's `auth_error_code_USER_NOT_FOUND` (49 uppercase better-auth keys). Final fix: full rebuild from `git show HEAD:client/messages/{en,vi}.json` (raw values with `{param}` placeholders intact — paraglide compiles them to `${i?.param}`, which was contaminating values), then reapply the 22 key renames + 8 value renames, then insert today's 2 new keys (`settings_companion_bot_name` = "Bot name"/"Tên bot" after `settings_companion_use_emoji`; `notes_page_ai_title_failed` after `notes_page_ai_title_success`). Verified: 582/582 keys, parity 0/0, zero `${\` interpolation artifacts, zero copilot keys/values, uppercase auth spellings restored, spot-checked renamed values ("AI Companion"/"Hỏi AI Companion"/"Thông báo Companion").
- [x] **SAFETY RULE** — never use inline `node -e "…"` or complex PowerShell string batches for text replacement (shell strips quotes → corrupts patterns); always write a temp `.js` script in `%temp%\opencode\` and run it.
- [x] **Verification (final state)** — `bun --bun run generate-translation` ✓; `bun --bun check` ✓ exit 0 (pre-existing warnings only: notes-sort-select empty file, nav-secondary unused imports, deprecated note-batch-actions/filter-sidebar, use-tags, tags-page, use-is-os, $noteId catch param); `bun --bun run build` (tsc -b + vite) ✓ built in 22.46s.
- [x] **Artifacts** — `feature_list.json`: feat-036 "Copilot to Companion Rename" done (evidence: renamed files + sources); feat-006 name "AI Chat / Companion"; feat-007 "Settings (General, Companion, Templates)" with companion wording + renamed evidence paths; feat-016/feat-021/feat-033/feat-034 evidence paths updated to companion-tab/companion-config. File validated (36 feats). `progress.md` updated with this session's incidents + recovery.
- [x] **No commit** — user manages staging/committing themselves; no auto-commit (per instruction).

### What's Done (client sync with staged backend + AI note title generation)

- [x] **Backend context (staged by user, not committed)** — new `POST /api/v1/ai/generator/note-title` (body `{content}` min 1 / max 1500, auth-protected, returns `{ title }` ≤ 60 chars); notes-service auto-generates title on create when blank (circuit-breaker fallback); RabbitMQ event-driven embeddings (`note.events` → `note_embeddings`); settings schema gained `botName` (`z.string().trim().min(1).max(40).default('Synapse')`, injected into chat system prompt).
- [x] **Copilot tab: bot name input** — `AiSettings` gained `botName`; `DEFAULT_AI_SETTINGS.botName = 'Synapse'`; `copilot-tab.tsx` renders a Bot name `Input` (maxLength 40, empty value guarded client-side since backend rejects blank) above the response-length row. New i18n `settings_copilot_bot_name`.
- [x] **`generateNoteTitle` API fn** — `features/notes/api.ts` POSTs to `/api/v1/ai/generator/note-title` with content sliced to 1500 chars (`MAX_NOTE_CONTENT_LENGTH`), unwraps `data.title`.
- [x] **Create page (`/notes/create`)** — switched to new `noteCreateFormSchema` (title now optional, max 200) so blank titles hit the backend auto-title path; added Sparkles button on the title input row (disabled without content / while pending, spinner while loading, success → `setValue('title', ..., { shouldDirty: true })` + toast, error → toast `notes_page_ai_title_failed`). `createNote` + `useCreateNoteMutation` widened to `NoteCreateFormValues` (deprecated quick-create dialog still compiles — `NoteFormValues` assignable).
- [x] **Note detail (`$noteId.tsx`)** — wired the previously-disabled "Generate title" dropdown item: enabled (disabled only while generating or when content empty), spinner icon while pending, writes generated title into the form (`shouldDirty`).
- [x] **i18n** — added `notes_page_ai_title_failed`, `settings_copilot_bot_name` to en.json AND vi.json; `bun --bun generate-translation` ✓; en/vi parity verified programmatically (0/0).
- [x] **Verification** — `bun --bun check` ✓ (0 errors, pre-existing warnings only), `bun --bun run build` (tsc -b + vite) ✓ exit 0.
- [x] **Artifacts** — `feature_list.json`: feat-007 description updated (bot name), feat-034 "AI Note Title Generation" done, feat-035 "Chat with Note" not-started (deferred — needs backend `noteId` scoping first; `notes_page_card_chat_with_note` key reserved). File validated as JSON.
- [x] **No commit** — user manages staging/committing themselves; no auto-commit (per instruction).

### What's Done (AI chat backend integration + conversation history + settings migration)

- [x] **Infra/backend CORS** — `infra/kong/kong.yml` ai-service plugin adds `exposed_headers: [X-Conversation-Id]`; `services/ai/src/app.ts` adds `exposeHeaders: ['Content-Length', 'X-Conversation-Id']`. (Pre-existing unstaged rate-limiting plugin in kong.yml left as-is.)
- [x] **Dependency** — `@ai-sdk/react@4.0.50` installed (pairs with `ai@7.0.47`; `@ai-sdk/react@^7` does not exist). Verified v7 API from `node_modules` runtime: `useChat` only recreates the Chat when `id` changes; callbacks (`onError`, `transport`, etc.) flow through a per-render `latestRef`, so fresh identities are fine; `messages` option seeds state at construction only; no `persistMessages` in v7; status = `'submitted'|'streaming'|'ready'|'error'`.
- [x] **`src/features/chat/lib/chat-transport.ts`** — `SynapseChatTransport extends DefaultChatTransport<UIMessage>`: wraps native `fetch` to read the `X-Conversation-Id` response header (updates its own `conversationId` + fires `onConversationId`); `prepareSendMessagesRequest` sends `{ conversationId, message: lastUserMessage }` (server is source of truth — DB persists full history) + `Authorization: Bearer` from `authClient.token()`. `credentials: 'include'` + native fetch (streaming response — `$fetch`/`ApiResponse` envelope NOT used here).
- [x] **`src/features/chat/hooks/use-chat-session.ts`** — `useChat({ id: <stable per mount>, messages: initialMessages, transport, onError })`. Transport created once via `useState` initializer (seeded with the initial conversation id so loaded conversations continue, not fork). `id` derived from `initialConversationId ?? 'new-chat'`.
- [x] **`src/features/chat/hooks/use-conversations.ts`** — lists conversations via `GET /api/v1/ai/conversations` (desc `updatedAt`); refresh() after first response.
- [x] **`src/features/chat/lib/chat-api.ts`** — typed API fns: `listConversations`, `getConversationMessages` (`GET /api/v1/ai/conversations/:id/messages`), `getAiSettings`, `updateAiSettings` (types mirror backend `settingsSchema` + `PERSONALITY_PRESETS`).
- [x] **`chat-page.tsx`** — left rail (Claude/Gemini-style) inside `/chat`: header + new-chat button, scrollable conversation list (skeleton while loading, empty state, active highlight). Right = `ChatBot` remounted via `sessionKey` only on explicit new-chat/select (NOT on conversationId capture, so streaming isn't reset); loaded history seeded via `initialMessages`; title falls back to `chat_conversation_untitled`.
- [x] **`chat-bot.tsx`** — rewired to `useChatSession`; renders UIMessage parts: `text` → `Message`/`MessageContent`/`MessageResponse` (Streamdown), `reasoning` → `Reasoning` (streaming-aware), `source-url`/`source-document` → `Sources`/`Source`, other parts skipped. Empty state shows agent name + suggestion chips (click → `sendMessage`). Stop button → `chat.stop()`. Attachments blocked with `chat_attachments_not_supported` toast (server is text-only). Web-search toggle + model selector remain visual-only per plan. Works standalone in `app-right-sidebar` (no rail props).
- [x] **Mock cleanup** — `lib/chat.ts` (personas/mock history) deleted; `chat-mock-data.ts` trimmed to `Model`, `models`, `suggestions`, `chefs`; `copilot-config.ts` trimmed to `NoteTemplate`/`PREDEFINED_TEMPLATES`/custom-template localStorage helpers (still used by `templates-tab.tsx` + `features/notes/components/deprecated/template-selector.tsx`).
- [x] **Settings migration** — `src/features/settings/hooks/use-ai-settings.ts` (GET/PUT `/api/v1/ai/settings`, `DEFAULT_AI_SETTINGS`, `resetToDefaults`); `copilot-tab.tsx` rewritten to backend fields (preset buttons incl. custom → custom instructions textarea, response length + language selects, emoji switch, debounced auto-save + manual save + reset, skeletons while loading); `settings-page.tsx` no longer owns CopilotConfig (CopilotTab self-contained; general-tab localStorage toggles unchanged). `PersonaId`/`CopilotConfig`/`DEFAULT_COPILOT_CONFIG`/`loadCopilotConfig`/`saveCopilotConfig` removed.
- [x] **i18n** — updated `chat_agent_name`→"Synapse"/desc; added `chat_conversations`, `chat_new_chat`, `chat_conversation_untitled`, `chat_conversations_empty`, `chat_conversation_load_failed`, `chat_attachments_not_supported`, `chat_error_send`; added 10 `settings_copilot_*` keys; removed dead `chat_page_*` (12), `chat_files_attached*`, `chat_sent_with_attachments`, and 12 obsolete `settings_page_copilot_*`/`settings_copilot_*` keys from en.json AND vi.json. `bun --bun generate-translation` ✓; en/vi key parity verified programmatically (0/0).
- [x] **Verification** — `bun --bun install` ✓, `bun --bun check` ✓ (0 errors; pre-existing warnings only), `bun --bun run build` (tsc -b + vite) ✓ exit 0.

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
1. Chat with Note (feat-035) — needs backend first: optional `noteId` in `chatRequestSchema` + RAG scoping to that note's embedding; then wire note-card action (i18n key `notes_page_card_chat_with_note` reserved)
2. AI Tab Completion Plugin (feat-023)
3. Voice-to-Text in Notes (feat-024)
4. PDF Export (feat-027)
5. Quick Note Dialog (feat-028)
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
1. Chat with Note (feat-035) — needs backend first: optional `noteId` in `chatRequestSchema` + RAG scoping to that note's embedding; then wire note-card action (i18n key `notes_page_card_chat_with_note` reserved)
2. AI Tab Completion Plugin (feat-023)
3. Voice-to-Text in Notes (feat-024)
4. PDF Export (feat-027)
5. Quick Note Dialog (feat-028)

## Key Findings

- Base-UI `ToggleGroup` uses array-based `value`/`onValueChange` (`value={[layoutMode]}`, `values?.[0]`) — not the single-value API you'd expect from a segmented control.
- `ai@7.0.47` `useChat` has `setMessages` but NO `prependMessages` — prepend older pages via functional update `chat.setMessages((prev) => [...older, ...prev])`.
- Client fetch RPC types are hand-written in `src/features/companion/types/api.ts` — backend schema changes do not auto-propagate; update both.
- Tailwind v4 container queries use the `@container/top-header` + `@min-[640px]/top-header:variant` syntax; breadcrumb collapse is JS-driven (`useElementWidth`), label/kbd hiding is container-query-driven.
- **Prettier + git autocrlf churn**: prettier's default `endOfLine: lf` rewrites untouched CRLF files → git shows them as modified with `git diff --numstat` = `0 0`. Revert those (they're pure line-ending churn); do NOT run whole-directory `bun --bun check` in `services/ai` (formats `.`). Scope prettier/oxlint/eslint to changed files only.
- `tsc` is not on PATH on Windows — use `bun --bun tsc -b` (and `bun --bun x <bin>` / `bun --bun node_modules/.bin/<bin>` for scoped tool runs).
- TanStack Router's `staticData` + `useMatches()` pattern provides clean breadcrumb resolution without extra context/providers
- Paraglide message keys must be added to both en.json and vi.json simultaneously
- FAB auto-hide via `scale-0 pointer-events-none opacity-0` is smoother than conditional rendering
- URL-driven views work well with TanStack Router's `validateSearch` + `stripSearchParams` pattern
- Backend uses 0-indexed pagination; FE stores 1-indexed in URL with page - 1 conversion in the API layer
- Bulk Pin/Tag remain no-ops (no BE endpoint exists)
- base-ui `useDismiss` Escape handler (`closeOnEscapeKeyDown`) does NOT check `event.defaultPrevented` — it closes the dialog unconditionally via a document-level bubble listener. To override it (e.g. Escape = "go back" inside command output), bind in the capture phase on window and call `stopPropagation()`
- **i18n corruption lessons (2026-08-02)**: (1) Inline PowerShell/node -e strings lose double quotes — a mangled replacement pair became a global `('s','e')` replace. Always use script files for bulk text edits. (2) `src/paraglide/messages/*.js` are a valid recovery source for message JSON only when values contain NO `{params}` — paraglide compiles `{appName}` to `${i?.appName}`, so parameterized values must come from git HEAD, not from compiled output. (3) Paraglide normalizes message keys to lowercase + numeric disambiguation suffix; source-of-truth `messages/*.json` spellings (e.g. uppercase `auth_error_code_USER_NOT_FOUND`) must not be taken from generated files.
- `git show HEAD:<path>` is the safest ground truth for any file recovery — rebuild from it, then reapply only the known intended delta
- zustand persist shapes are `{ state, version }` in localStorage; to read a persisted value outside React (e.g. `readPersistedLayoutMode`), JSON.parse the key and read `.state.<field>`.
- Shortcut overrides store uses `combos: string[] | null` (null = disabled). `getEffectiveCombos` returns `[]` when overridden-disabled; UI (settings row + shortcuts list dialog) renders "Disabled" for empty combos.
- Remap capture requires ≥1 modifier (parts.length < 2 → ignore); Escape cancels; Backspace NOT implemented as clear. Captured combo is normalized (`meta`/`ctrl` → `mod`) before `setBinding`.

## Blockers / Risks

- Kong rate-limiting plugin (minute: 5, limit_by: credential) on the ai-service may 429 heavy local testing — pre-existing, out of scope.
- `services/ai` `tsc -b` fails on a PRE-EXISTING unrelated error: `src/embeddings/services.ts(90,40)` — `EmbeddingModelV4Embedding | null` not assignable to `number[]`. Not caused by feat-046; services/ai gate is `bun --bun check` only.
- Pagination API is unverified end-to-end (no local DB/ai-service run this session) — page 2+ fetch path needs a manual smoke test.
- AI title generation requires the ai-service up (circuit breaker only guards the notes-service auto-title path, not the direct client call).
- RAG retrieval stays empty until RabbitMQ is running (`compose.yml` rabbitmq:4.3.4-management) and at least one note create/update event has been embedded.

## Decisions Made

- **One registry + one store** for all shortcuts (global, sidebar, editor) — `keyboard-shortcuts.ts` is the single source of truth; features read effective combos via `useShortcut`/`useFormSaveShortcut` instead of hardcoding keys (RULES.md single-source principle).
- **Shortcut overrides are per-id**, not per-scope; a single conflict check across one namespace (editor = all editor shortcuts; global = all global) rejects new `mod+b` assignments in the editor because toggle-left-sidebar already owns it. Editor/global scopes are separate namespaces (mod+b overload allowed between scopes).
- **Editor shortcut matching uses `event.key`** (`getKeyCombo`) instead of `event.code` — accepted shift (code-based match was dropped in the registry-driven rebuild); non-latin layouts may need a smoke test.
- **Overrides persist globally** (not per-layout-mode): Settings > Shortcuts edits `synapse-shortcuts` localStorage; effective combos flow reactively into global bindings, sidebar, editor plugin, and the shortcuts-list dialog.
- **Layout mode naming**: internal value `'agent'` (kept from `'servant'`), user-facing name "AI Companion" (never "copilot"); migrate map handles the persisted `'servant'` value.
- **Chat mode = single-column**: right panel hidden entirely in chat mode (breadcrumb + notes remain full-width); agent mode = expanded right sidebar.
- **`centered` prop** (not a separate CSS class in global CSS) keeps Tailwind utilities colocated with ChatBot.
- **Paginated load** replaces one-shot `loadHistory` on the client; server keeps unpaged `loadHistory` for AI request context.
- **Chat transport**: custom `DefaultChatTransport` subclass with native `fetch` wrapper reading `X-Conversation-Id`; DB is source of truth (send only last user message; backend persists full conversation).
- **Session lifecycle**: `ChatBot` remounts via `sessionKey` only on explicit new-chat / select-conversation; captured conversation id updates state without remount so streaming continues.
- **Attachments / web search / model selector**: UI kept, non-functional (attachments blocked by client toast; server is text-only).
- **Settings**: Companion tab now server-backed (`/api/v1/ai/settings`); localStorage CopilotConfig persona identity removed entirely (feat-021 deprecated). 2026-08-02: all user-facing "Copilot" branding renamed to "Companion" (feat-036); `github-copilot` model id kept (technical identifier).
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

- feat-049 (remappable shortcuts) is done and verified (lint/tsc/build) but NOT smoke-tested in a running app. With the stack up: (1) Settings > Shortcuts remap editor-bold, global focus-search, save-note; confirm persistence across reload + conflict rejection on `mod+b`; (2) confirm editor bindings still fire (event.key matching), (3) `/create` content prefill via command palette `/create`, (4) agent-mode `/chat` still redirects to /notes.
- feat-049 staged alongside feat-044..048 + deprecated renames; user manages commits.
- Remaining features: Chat with Note (feat-035, needs backend noteId scoping), AI Tab Completion (feat-023), Voice-to-Text (feat-024), PDF Export (feat-027), Quick Note Dialog (feat-028)
- **SMOKE TEST NEEDED (manual)**: feat-046 pagination + feat-044/045 responsive layout are verified by typecheck/lint/build only. With the stack up, confirm: (1) first click on a fresh conversation sends immediately, (2) scrolling to the top of an old (>15 msg) conversation loads older messages without jumping, (3) chat↔agent toggle animates the right panel and hides the header toggle in chat mode, (4) breadcrumb collapses to the ⋯ dropdown under 640px, (5) Companion Insert/Replace writes into the active note editor.
- feat-044/045/046/047 staged; user manages commit (staged already — nothing else to stage).
- **BACKEND VERIFY PENDING (user)**: companion settings save also depends on deploying the staged ai-service — apply `services/ai` migration (adds `user_ai_settings.bot_name`) + rebuild/restart ai container, then curl GET/PUT `/api/v1/ai/settings`. Client now surfaces failures via `settings_page_save_failed` toast instead of failing silently.
- Staged backend (generator module, embeddings/RabbitMQ, notes events, botName) + client changes in this session are NOT committed — user manages commits
- **Open question for user**: "change any copilot to companion" was applied to the CLIENT only. `services/`, `infra/`, docs were NOT grepped — check repo-wide copilot references if the rename should extend beyond the client (model id `github-copilot` is expected to stay regardless).
- Temp recovery scripts (recover-messages.js, rebuild-from-head.js, rename-companion.js, verify-recovery.js, fix-auth-keys.js, rename-sources.js) live in `%temp%\opencode\` — no longer needed but kept as incident evidence
- Tag filter is hardcoded — wire to real tag data when tags API is ready
- View toggle state is local — promote to URL search param if persistence needed
