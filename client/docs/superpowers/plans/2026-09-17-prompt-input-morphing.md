# Prompt Input Style Morphing Implementation Plan

> **Goal:** Port the adaptive dynamic morphing prompt input from ARIA (`D:\Personal\Project\A.R.I.A\desktop\src\features\chat`) into Synapse (`client/src/features/companion`).
> **Context:** Morph between a single-row compact pill mode (collapsed) and a multi-line boxed card mode (expanded) based on text length, newlines, and attached files.

---

## Proposed Changes

### Component Decomposition

Following `docs/RULES.md` (Rule of Three, single responsibility, no component towers):

1. **`src/features/companion/components/conversation-prompt-parts.tsx`**
   - Subcomponents for parts of the prompt input:
     - `AttachmentActionsMenu`: Dropdown trigger and file upload menu item.
     - `PromptToolActions`: Left-aligned toolbar in expanded mode.
     - `RightActionCluster`: Right-aligned submit and stop button.
2. **`src/features/companion/components/conversation-prompt-input.tsx`**
   - Main container component wrapped with `PromptInputProvider`.
   - Computes `isExpanded` dynamically:
     - `attachments.files.length > 0`
     - `text.includes('\n')`
     - `text.length > 70`
     - `pendingNoteAttachments.length > 0`
   - Applies Tailwind CSS slot styles for smooth transitions:
     - Pill mode: single row, rounded pill, compact textarea, left attachment menu, right submit button.
     - Expanded mode: multi-row, rounded-2xl, top attachments preview, multi-line expanding textarea, bottom toolbar with border separator.
3. **`src/features/companion/components/chat-bot.tsx`**
   - Replace bloated inline `<PromptInput>` block with `<ConversationPromptInput>`.
4. **`src/features/companion/components/index.ts`** & **`src/features/companion/index.ts`**
   - Export new components.

---

## Detailed Task Breakdown

### Task 1: Create `conversation-prompt-parts.tsx`

- Create `src/features/companion/components/conversation-prompt-parts.tsx`
- Export `AttachmentActionsMenu`, `PromptToolActions`, `RightActionCluster`
- Ensure strict typing (no `any`, `exactOptionalPropertyTypes: true`).

### Task 2: Create `conversation-prompt-input.tsx`

- Create `src/features/companion/components/conversation-prompt-input.tsx`
- Use `PromptInputProvider` to manage and observe global attachments reactively.
- Define `ConversationPromptInputProps`:
  - `onSubmit: (message: PromptInputMessage) => void`
  - `onTextChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void`
  - `disabled?: boolean`
  - `centered?: boolean`
  - `status: ChatStatus`
  - `onStop: () => void`
  - `text: string`
- Calculate `isExpanded` based on text and attachments.
- Connect `PromptInputAttachmentsDisplay` in header.
- Apply morphing styles via CSS data-slot overrides matching ARIA.

### Task 3: Refactor `chat-bot.tsx`

- Replace inline `<PromptInput>` in `chat-bot.tsx` with `<ConversationPromptInput>`.
- Re-export `ConversationPromptInput` in `src/features/companion/components/index.ts` and `src/features/companion/index.ts`.

### Task 4: Verification & Documentation

- Run `bun --bun run lint` (0 errors, 0 warnings).
- Run `bun --bun run typecheck` (0 errors).
- Run `bun --bun run build`.
- Update `progress.md`.
