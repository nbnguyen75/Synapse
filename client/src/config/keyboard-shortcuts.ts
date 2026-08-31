import { normalizeHotkey } from '@tanstack/hotkeys';

import { m } from '@/paraglide/messages';

export type ShortcutSectionId = 'global' | 'editor';

export type ShortcutId =
  | 'show-keyboard-shortcuts'
  | 'toggle-right-sidebar'
  | 'editor-strikethrough'
  | 'editor-numbered-list'
  | 'toggle-left-sidebar'
  | 'editor-normal-text'
  | 'editor-bullet-list'
  | 'go-to-create-note'
  | 'editor-blockquote'
  | 'editor-underline'
  | 'editor-highlight'
  | 'command-palette'
  | 'editor-heading1'
  | 'editor-heading2'
  | 'editor-heading3'
  | 'editor-italic'
  | 'focus-search'
  | 'toggle-theme'
  | 'go-to-notes'
  | 'editor-bold'
  | 'editor-code'
  | 'editor-link'
  | 'save-note';

export interface KeyboardShortcutEntry {
  section: ShortcutSectionId;
  label: () => string;
  /** Normalized bindings, may use the `mod` token. */
  combos: string[];
  id: ShortcutId;
  group?: string;
}

export const KEYBOARD_SHORTCUT_SECTIONS: Record<ShortcutSectionId, { label: () => string }> = {
  global: { label: () => m.keyboard_shortcuts_global() },
  editor: { label: () => m.keyboard_shortcuts_editor() },
};

export const EDITOR_SHORTCUT_GROUPS: Record<string, { label: () => string }> = {
  structure: { label: () => m.lexical_shortcuts_section_structure() },
  lists: { label: () => m.lexical_shortcuts_section_lists() },
  text: { label: () => m.lexical_shortcuts_section_text() },
};

export const KEYBOARD_SHORTCUTS: Record<ShortcutId, KeyboardShortcutEntry> = {
  'editor-strikethrough': {
    label: () => m.keyboard_shortcuts_strikethrough(),
    id: 'editor-strikethrough',
    combos: ['mod+shift+x'],
    section: 'editor',
    group: 'text',
  },
  'editor-numbered-list': {
    label: () => m.lexical_shortcuts_numbered_list(),
    id: 'editor-numbered-list',
    combos: ['mod+shift+7'],
    section: 'editor',
    group: 'lists',
  },
  'editor-normal-text': {
    label: () => m.lexical_shortcuts_normal_text(),
    id: 'editor-normal-text',
    combos: ['mod+alt+0'],
    group: 'structure',
    section: 'editor',
  },
  'editor-bullet-list': {
    label: () => m.lexical_shortcuts_bullet_list(),
    id: 'editor-bullet-list',
    combos: ['mod+shift+8'],
    section: 'editor',
    group: 'lists',
  },
  'editor-blockquote': {
    label: () => m.lexical_shortcuts_block_quote(),
    id: 'editor-blockquote',
    combos: ['mod+shift+q'],
    section: 'editor',
    group: 'lists',
  },
  'editor-highlight': {
    label: () => m.keyboard_shortcuts_highlight(),
    combos: ['mod+shift+h'],
    id: 'editor-highlight',
    section: 'editor',
    group: 'text',
  },
  'editor-heading1': {
    label: () => m.lexical_shortcuts_heading1(),
    id: 'editor-heading1',
    combos: ['mod+alt+1'],
    group: 'structure',
    section: 'editor',
  },
  'editor-heading2': {
    label: () => m.lexical_shortcuts_heading2(),
    id: 'editor-heading2',
    combos: ['mod+alt+2'],
    group: 'structure',
    section: 'editor',
  },
  'editor-heading3': {
    label: () => m.lexical_shortcuts_heading3(),
    id: 'editor-heading3',
    combos: ['mod+alt+3'],
    group: 'structure',
    section: 'editor',
  },
  'editor-underline': {
    label: () => m.keyboard_shortcuts_underline(),
    id: 'editor-underline',
    combos: ['mod+u'],
    section: 'editor',
    group: 'text',
  },
  'toggle-right-sidebar': {
    label: () => m.keyboard_shortcuts_toggle_right(),
    id: 'toggle-right-sidebar',
    combos: ['mod+alt+b'],
    section: 'global',
  },
  'show-keyboard-shortcuts': {
    label: () => m.sidebar_keyboard_shortcuts(),
    id: 'show-keyboard-shortcuts',
    section: 'global',
    combos: ['mod+/'],
  },
  'editor-italic': {
    label: () => m.keyboard_shortcuts_italic(),
    id: 'editor-italic',
    section: 'editor',
    combos: ['mod+i'],
    group: 'text',
  },
  'toggle-left-sidebar': {
    label: () => m.keyboard_shortcuts_toggle_left(),
    id: 'toggle-left-sidebar',
    section: 'global',
    combos: ['mod+b'],
  },
  'editor-link': {
    label: () => m.keyboard_shortcuts_link(),
    id: 'editor-link',
    combos: ['mod+k'],
    section: 'editor',
    group: 'text',
  },
  'editor-bold': {
    label: () => m.keyboard_shortcuts_bold(),
    id: 'editor-bold',
    section: 'editor',
    combos: ['mod+b'],
    group: 'text',
  },
  'editor-code': {
    label: () => m.keyboard_shortcuts_code(),
    id: 'editor-code',
    section: 'editor',
    combos: ['mod+e'],
    group: 'text',
  },
  'go-to-create-note': {
    label: () => m.keyboard_shortcuts_create_note(),
    id: 'go-to-create-note',
    section: 'global',
    combos: ['c n'],
  },
  'command-palette': {
    label: () => m.keyboard_shortcuts_cmd_palette(),
    id: 'command-palette',
    section: 'global',
    combos: ['mod+k'],
  },
  'toggle-theme': {
    label: () => m.keyboard_shortcuts_toggle_theme(),
    combos: ['mod+alt+t'],
    id: 'toggle-theme',
    section: 'global',
  },
  'focus-search': {
    label: () => m.keyboard_shortcuts_focus_search(),
    id: 'focus-search',
    section: 'global',
    combos: ['/'],
  },
  'go-to-notes': {
    label: () => m.keyboard_shortcuts_go_to_notes(),
    id: 'go-to-notes',
    section: 'global',
    combos: ['g n'],
  },
  'save-note': {
    label: () => m.keyboard_shortcuts_save_note(),
    section: 'global',
    combos: ['mod+s'],
    id: 'save-note',
  },
};

export function getShortcut(id: ShortcutId): KeyboardShortcutEntry {
  return KEYBOARD_SHORTCUTS[id];
}

export function getShortcutsBySection(section: ShortcutSectionId): KeyboardShortcutEntry[] {
  return Object.values(KEYBOARD_SHORTCUTS).filter((entry) => entry.section === section);
}

/**
 * Resolves the effective combos for a shortcut: a stored override wins over
 * the registry default. An override of `[]` disables the shortcut ("None").
 */
export function getEffectiveCombos(
  id: ShortcutId,
  overrides: Partial<Record<ShortcutId, string[]>>,
): string[] {
  return overrides[id] ?? KEYBOARD_SHORTCUTS[id].combos;
}

/**
 * Converts a recorded canonical hotkey (e.g. `Mod+Shift+N`) into the lowercase
 * `mod`-based form stored by the registry (`mod+shift+n`).
 */
export function toRegistryCombo(hotkey: string): string {
  return hotkey.toLowerCase();
}

/**
 * Normalizes a combo for conflict comparison. Sequence combos (`'g n'`) are
 * compared token-wise against single-key combos and other sequences, so a
 * sequence's steps participate in the same conflict rules as chords.
 */
function normalizeComboForCompare(combo: string): string {
  return combo
    .split(/\s+/)
    .map((token) => normalizeHotkey(token))
    .join(' ');
}

/**
 * Returns the first shortcut (other than `targetId`) whose effective combos
 * collide with `proposedCombos`, comparing on the TanStack canonical form
 * (case-insensitive, alias- and platform-aware). Sequence steps are compared
 * individually against single-key combos.
 */
export function findShortcutConflict(
  proposedCombos: string[],
  targetId: ShortcutId,
  overrides: Partial<Record<ShortcutId, string[]>>,
): KeyboardShortcutEntry | null {
  const proposed = new Set(proposedCombos.map((combo) => normalizeComboForCompare(combo)));

  for (const entry of Object.values(KEYBOARD_SHORTCUTS)) {
    if (entry.id === targetId) continue;

    const combos = getEffectiveCombos(entry.id, overrides);
    for (const combo of combos) {
      if (proposed.has(normalizeComboForCompare(combo))) return entry;
    }
  }

  return null;
}
