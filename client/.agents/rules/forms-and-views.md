# Forms & View-Logic Architecture Rules

Strict frontend conventions for all features, forms, and pages in ARIA Desktop.

## 1. Forms & Validation
- **TanStack Form + Zod v4**: ALWAYS use `@tanstack/react-form` with `zod` (`import { z } from 'zod/v4';`) for all forms: creating resources, editing resources, login, and registration. Never use unvalidated hand-rolled `useState` clusters for forms.
- **Form Field Components**: ALWAYS construct form layouts with `Field`, `FieldGroup`, `FieldLabel`, `FieldContent`, `FieldDescription`, and `FieldError` from `@/components/ui/field`. Refer to the standard pattern established in `src/features/notes/components/note-form.tsx`.
- **Validation Messages via Paraglide**: ALWAYS supply Zod schema error messages using Paraglide message functions (`import { m } from '@/paraglide/messages';`), e.g. `z.string().trim().min(1, m.notes_content_required_warning())`.
- **Disable Submit When Not Dirty or Invalid**: ALWAYS disable the submit button whenever the form is not dirty, invalid, or currently submitting (`!canSubmit || !isDirty || isSubmitting`). Untouched or invalid forms cannot be submitted.

## 2. Component Hierarchy & State Lifting
- **Lift State Up for Forms**: Form components (`*Form`) must NOT manage their own enclosing dialog, sheet, drawer, or route visibility internally. The parent component or container owns the dialog/modal state and open/close controls.
- Form components must be pure presentation and input containers, receiving props (e.g. `form`, `disabled`, `onCancel`).

## 3. Separation of Logic and View
- **Logic in Custom Hooks**: All page-level or feature-level logic (TanStack Query calls, mutations, modal controls, filter state, complex transformations, delete confirmations) MUST live in dedicated custom hooks (e.g. `useTasksList`, `useHabitsMatrix`, `useNoteUpsertDialog`).
- **Hook Return Shape**: Group hook returns into `state` and `actions` (`const { state, actions } = useFeature()`).
- **View-Only Components**: UI components and page components should be clean presentation layers that consume the custom hook and render the returned state and handlers. Do not inline heavy business or fetching logic in JSX views.

## 4. Single Responsibility Principle (SRP) for Stores & Hooks
- **No Monolithic Stores**: Do NOT mix list filtering, table row selection, search queries, and modal dialog lifecycles into a single monolithic store.
- **Dedicated Modal/Dialog Stores**: Dedicated dialog/modal components (e.g. `NoteUpsertDialog`) MUST have their own isolated store (e.g. `useNoteUpsertDialogStore`), while feature list stores (`useNotesStore`) ONLY manage list view state (`viewMode`, search query, active filters, selection, pinning).
- **No Duplicate Mutations**: Page hooks (`useNotesPage`) must not define duplicate mutations (`createMutation`, `updateMutation`) that are already encapsulated inside dedicated dialog hooks (`useNoteUpsertDialog`). Keep mutations co-located with the component that actually submits the form.

## 5. Component File Structure & Exports
- **Default Function per Component File**: Every file in a `components/` directory must contain a `default function ComponentName(...)` as the single primary export proving the file represents that component.
- **Explicit Named Re-export via index.ts**: Re-export components explicitly by name via `index.ts` in the components folder or feature root (`export { default as ComponentName } from './components/component-name';` or `export { ComponentName } from './components';`). NEVER use wildcard re-exports (`export * from ...`) in `index.ts`; only export symbols that are intentionally exposed and consumed externally.

## 6. Extract Repeated UI Components (DRY UI)
- **Reusable Component Extraction**: Any UI layout, block, or sub-pattern that is repeated across views or within a page (e.g. settings sections, page headers, section descriptions, summary cards, action bars) MUST be extracted into a dedicated reusable component (e.g. `SettingsSection`, `PageHeader`, `SectionDescription`) rather than repeating raw markup and styling.

## 7. Non-Relative Imports & Module Boundaries
- **Always Non-Relative**: ALL imports must use non-relative alias paths (`@/...`), never relative paths (`./` or `../`).
- **Feature Boundary**: When code outside a feature needs a component or value, it MUST import from `@/features/<feature-name>`.
- **Intra-Feature Subfolder Imports**: Code inside a feature may import from subfolders using non-relative aliases:
  - `import { ... } from '@/features/<feature>/schemas';`
  - `import { ... } from '@/features/<feature>/hooks';`
  - `import { ... } from '@/features/<feature>/components';`
  - `import { ... } from '@/features/<feature>/store';`
- **UI Components**: Import as usual: `import { Button } from '@/components/ui/button';`.

## 8. Confirm Dialog & Batch Deletion
- **Always Confirm Permanent Deletions**: Never execute a permanent record deletion mutation directly from a click event. ALWAYS require an explicit confirmation dialog (`useConfirm()` modal) with destructive styling and clear warning text before invoking delete mutations.
- **Batch Delete via ID List (No Individual Loops)**: When performing batch deletion on multiple items, NEVER loop and trigger individual delete mutations or HTTP requests one by one. ALWAYS send a list/array of IDs (`ids: string[]`) in a single batch delete request or batch mutation.

## 9. Shadcn UI Component Usage & Shared Custom Components
- **Shadcn Primitives in `components/ui/`**: `src/components/ui/` is strictly reserved for shadcn UI component primitives (`@/components/ui/*` - Button, Badge, Progress, Tabs, DropdownMenu, Checkbox, Dialog, Sheet, Breadcrumb, Field, etc.).
- **Shared Custom Components in Dedicated Folders**: Custom in-house shared components (such as `tag-input`, `editor`, `page-state`, `routing`, `ai-elements`, etc.) MUST live in their own dedicated subdirectories under `src/components/<component-name>/` (e.g. `@/components/tag-input`), NEVER inside `src/components/ui/`.
- **Prefer Shadcn Primitives**: ALWAYS prefer composing with `@/components/ui/*` primitives rather than ad-hoc raw HTML elements.
- **Consistent Tokens**: Use standard shadcn design tokens and CSS variables configured in `styles.css` (`--background`, `--foreground`, `--card`, `--primary`, `--agent`, etc.).

## 10. Icons & Action Controls (No Literal `+` or Redundant Plus Signs)
- **Icons Over Literal Plus Characters**: Do NOT use literal text `+` characters in UI buttons, menus, or labels. Use proper Lucide icons (e.g. `<PlusIcon />`, `<FolderPlusIcon />`) instead.
- **No Redundant Plus With Icon**: If an action button or element already has an icon, DO NOT add an extra literal `+` character (e.g. for "Create" or "Add" buttons, render `<PlusIcon />` with localized text like `{m.common_create()}` or use an icon-only button with tooltip/aria-label; never render `+ Create` or double-plus combinations).

## 11. Typography & Fonts
- **No Indiscriminate Monospace**: Do NOT apply `font-mono` to generic UI copy, labels, headers, or body text. Standard UI text uses `font-sans` (`Be Vietnam Pro` + `Inter`) and `font-heading`.
- **Reserved Monospace**: Monospace (`font-mono tabular-nums`) is strictly reserved for numeric data, streak counts, percentages, dates/ranges, badges containing numbers, and code blocks.

## 12. Component Splitting & Refactoring Thresholds
- **JSX Depth & Length**: Split components when render lines exceed **150–200 lines** or JSX nesting is deeper than **4–5 levels**.
- **Distinct / Nameable Chunks**: Extract any identifiable UI chunk (e.g. Card, FilterBar, ActionToolbar) into a dedicated sub-component with a descriptive name.
- **Isolate Mixed Concerns**: Separate fetching (custom hook), validation/forms (`*Form`), dialog state (`*Dialog`), and presentation.
- **Complex Conditional Branches**: Extract nested ternaries and multi-branch `{condition && (...) || (...)}` trees into discrete sub-components.
- **Folder Organization by Component Domain**: Place sub-components, types, and hooks in a dedicated folder under `components/<component-name>/` with max 2 directory levels and explicit exports via `index.ts`.
- **Single Export Principle**: Each file is responsible for and exports exactly one primary component or utility.
- **Variants via `cva`**: Use `cva` for styling variants rather than embedding long inline className ternary logic.

