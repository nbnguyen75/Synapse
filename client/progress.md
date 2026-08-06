# Session Progress Log

## Current State

**Last Updated:** 2026-08-05
**Session ID:** settings-page-i18n-pass
**Active Feature:** Settings page i18n pass (companion settings page + toasts + route title + companion option label fix + orphan cleanup) — done; pre-existing build break in chat-transport.ts (user commit 3315f0b) fixed with type-only cast — done

## Status

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

- TanStack Router's `staticData` + `useMatches()` pattern provides clean breadcrumb resolution without extra context/providers
- Paraglide message keys must be added to both en.json and vi.json simultaneously
- FAB auto-hide via `scale-0 pointer-events-none opacity-0` is smoother than conditional rendering
- URL-driven views work well with TanStack Router's `validateSearch` + `stripSearchParams` pattern
- Backend uses 0-indexed pagination; FE stores 1-indexed in URL with page - 1 conversion in the API layer
- Bulk Pin/Tag remain no-ops (no BE endpoint exists)
- base-ui `useDismiss` Escape handler (`closeOnEscapeKeyDown`) does NOT check `event.defaultPrevented` — it closes the dialog unconditionally via a document-level bubble listener. To override it (e.g. Escape = "go back" inside command output), bind in the capture phase on window and call `stopPropagation()`
- **i18n corruption lessons (2026-08-02)**: (1) Inline PowerShell/node -e strings lose double quotes — a mangled replacement pair became a global `('s','e')` replace. Always use script files for bulk text edits. (2) `src/paraglide/messages/*.js` are a valid recovery source for message JSON only when values contain NO `{params}` — paraglide compiles `{appName}` to `${i?.appName}`, so parameterized values must come from git HEAD, not from compiled output. (3) Paraglide normalizes message keys to lowercase + numeric disambiguation suffix; source-of-truth `messages/*.json` spellings (e.g. uppercase `auth_error_code_USER_NOT_FOUND`) must not be taken from generated files.
- `git show HEAD:<path>` is the safest ground truth for any file recovery — rebuild from it, then reapply only the known intended delta

## Blockers / Risks

- Kong rate-limiting plugin (minute: 5, limit_by: credential) on the ai-service may 429 heavy local testing — pre-existing, out of scope.
- ChatBot's transport captures `onConversationId` at mount; safe because ChatPage passes a stable `useCallback` and ChatBot remounts per session.
- AI title generation requires the ai-service up (circuit breaker only guards the notes-service auto-title path, not the direct client call).
- RAG retrieval stays empty until RabbitMQ is running (`compose.yml` rabbitmq:4.3.4-management) and at least one note create/update event has been embedded.

## Decisions Made

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

- Remaining features: Chat with Note (feat-035, needs backend noteId scoping), AI Tab Completion (feat-023), Voice-to-Text (feat-024), PDF Export (feat-027), Quick Note Dialog (feat-028)
- **BACKEND VERIFY PENDING (user)**: companion settings save also depends on deploying the staged ai-service — apply `services/ai` migration (adds `user_ai_settings.bot_name`) + rebuild/restart ai container, then curl GET/PUT `/api/v1/ai/settings`. Client now surfaces failures via `settings_page_save_failed` toast instead of failing silently.
- Staged backend (generator module, embeddings/RabbitMQ, notes events, botName) + client changes in this session are NOT committed — user manages commits
- **Open question for user**: "change any copilot to companion" was applied to the CLIENT only. `services/`, `infra/`, docs were NOT grepped — check repo-wide copilot references if the rename should extend beyond the client (model id `github-copilot` is expected to stay regardless).
- Temp recovery scripts (recover-messages.js, rebuild-from-head.js, rename-companion.js, verify-recovery.js, fix-auth-keys.js, rename-sources.js) live in `%temp%\opencode\` — no longer needed but kept as incident evidence
- Tag filter is hardcoded — wire to real tag data when tags API is ready
- View toggle state is local — promote to URL search param if persistence needed
