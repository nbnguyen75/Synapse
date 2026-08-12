import { normalizeHotkey } from '@tanstack/hotkeys';

import { m } from '@/paraglide/messages';

export type ShortcutSectionId = 'global' | 'editor';

export type ShortcutId =
  | 'command-palette'
  | 'toggle-left-sidebar'
  | 'toggle-right-sidebar'
  | 'go-to-notes'
  | 'focus-search'
  | 'save-note'
  | 'show-keyboard-shortcuts'
  | 'editor-bold'
  | 'editor-italic'
  | 'editor-underline'
  | 'editor-strikethrough'
  | 'editor-code'
  | 'editor-heading1'
  | 'editor-heading2'
  | 'editor-heading3'
  | 'editor-normal-text'
  | 'editor-bullet-list'
  | 'editor-numbered-list'
  | 'editor-blockquote';

export interface KeyboardShortcutEntry {
  section: ShortcutSectionId;
  label: () => string;
  /** Keys rendered in the shortcuts UI. `mod` resolves to ⌘/Ctrl by OS. */
  display: string[];
  /** Normalized bindings, may use the `mod` token. */
  combos: string[];
  id: ShortcutId;
  group?: string;
}

export const KEYBOARD_SHORTCUT_SECTIONS: Record<
  ShortcutSectionId,
  { label: () => string }
> = {
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
    display: ['mod', 'Shift', 'X'],
    id: 'editor-strikethrough',
    combos: ['mod+shift+x'],
    section: 'editor',
    group: 'text',
  },
  'editor-numbered-list': {
    label: () => m.lexical_shortcuts_numbered_list(),
    display: ['mod', 'Shift', '7'],
    id: 'editor-numbered-list',
    combos: ['mod+shift+7'],
    section: 'editor',
    group: 'lists',
  },
  'editor-normal-text': {
    label: () => m.lexical_shortcuts_normal_text(),
    display: ['mod', 'Alt', '0'],
    id: 'editor-normal-text',
    combos: ['mod+alt+0'],
    group: 'structure',
    section: 'editor',
  },
  'editor-bullet-list': {
    label: () => m.lexical_shortcuts_bullet_list(),
    display: ['mod', 'Shift', '8'],
    id: 'editor-bullet-list',
    combos: ['mod+shift+8'],
    section: 'editor',
    group: 'lists',
  },
  'editor-blockquote': {
    label: () => m.lexical_shortcuts_block_quote(),
    display: ['mod', 'Shift', 'Q'],
    id: 'editor-blockquote',
    combos: ['mod+shift+q'],
    section: 'editor',
    group: 'lists',
  },
  'editor-heading1': {
    label: () => m.lexical_shortcuts_heading1(),
    display: ['mod', 'Alt', '1'],
    id: 'editor-heading1',
    combos: ['mod+alt+1'],
    group: 'structure',
    section: 'editor',
  },
  'editor-heading2': {
    label: () => m.lexical_shortcuts_heading2(),
    display: ['mod', 'Alt', '2'],
    id: 'editor-heading2',
    combos: ['mod+alt+2'],
    group: 'structure',
    section: 'editor',
  },
  'editor-heading3': {
    label: () => m.lexical_shortcuts_heading3(),
    display: ['mod', 'Alt', '3'],
    id: 'editor-heading3',
    combos: ['mod+alt+3'],
    group: 'structure',
    section: 'editor',
  },
  'toggle-right-sidebar': {
    label: () => m.keyboard_shortcuts_toggle_right(),
    display: ['mod', 'Alt', 'B'],
    id: 'toggle-right-sidebar',
    combos: ['mod+alt+b'],
    section: 'global',
  },
  'editor-underline': {
    label: () => m.keyboard_shortcuts_underline(),
    id: 'editor-underline',
    display: ['mod', 'U'],
    section: 'editor',
    combos: ['mod+u'],
    group: 'text',
  },
  'show-keyboard-shortcuts': {
    label: () => m.sidebar_keyboard_shortcuts(),
    id: 'show-keyboard-shortcuts',
    display: ['mod', '/'],
    section: 'global',
    combos: ['mod+/'],
  },
  'editor-italic': {
    label: () => m.keyboard_shortcuts_italic(),
    display: ['mod', 'I'],
    id: 'editor-italic',
    section: 'editor',
    combos: ['mod+i'],
    group: 'text',
  },
  'toggle-left-sidebar': {
    label: () => m.keyboard_shortcuts_toggle_left(),
    id: 'toggle-left-sidebar',
    display: ['mod', 'B'],
    section: 'global',
    combos: ['mod+b'],
  },
  'go-to-notes': {
    label: () => m.keyboard_shortcuts_go_to_notes(),
    display: ['mod', 'Shift', 'N'],
    combos: ['mod+shift+n'],
    section: 'global',
    id: 'go-to-notes',
  },
  'editor-bold': {
    label: () => m.keyboard_shortcuts_bold(),
    display: ['mod', 'B'],
    id: 'editor-bold',
    section: 'editor',
    combos: ['mod+b'],
    group: 'text',
  },
  'editor-code': {
    label: () => m.keyboard_shortcuts_code(),
    display: ['mod', 'E'],
    id: 'editor-code',
    section: 'editor',
    combos: ['mod+e'],
    group: 'text',
  },
  'command-palette': {
    label: () => m.keyboard_shortcuts_cmd_palette(),
    id: 'command-palette',
    display: ['mod', 'K'],
    section: 'global',
    combos: ['mod+k'],
  },
  'save-note': {
    label: () => m.keyboard_shortcuts_save_note(),
    display: ['mod', 'S'],
    section: 'global',
    combos: ['mod+s'],
    id: 'save-note',
  },
  'focus-search': {
    label: () => m.keyboard_shortcuts_focus_search(),
    id: 'focus-search',
    section: 'global',
    display: ['/'],
    combos: ['/'],
  },
};

export function getShortcut(id: ShortcutId): KeyboardShortcutEntry {
  return KEYBOARD_SHORTCUTS[id];
}

export function getShortcutsBySection(
  section: ShortcutSectionId,
): KeyboardShortcutEntry[] {
  return Object.values(KEYBOARD_SHORTCUTS).filter(
    (entry) => entry.section === section,
  );
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
 * Derives the Kbd-friendly display tokens (e.g. `['mod', 'Shift', 'N']`)
 * from a normalized combo string (e.g. `mod+shift+n`).
 */
export function combosToDisplay(combos: string[]): string[] {
  const combo = combos[0];
  if (!combo) return [];

  return combo.split('+').map((token) => {
    if (token === 'mod') return 'mod';
    if (token === 'ctrl') return 'Ctrl';
    if (token === 'meta') return 'Meta';
    if (token === 'shift') return 'Shift';
    if (token === 'alt') return 'Alt';
    return token.length === 1 ? token.toUpperCase() : token;
  });
}

/**
 * Returns the first shortcut (other than `targetId`) whose effective combos
 * collide with `proposedCombos`, comparing on the TanStack canonical form
 * (case-insensitive, alias- and platform-aware).
 */
export function findShortcutConflict(
  proposedCombos: string[],
  targetId: ShortcutId,
  overrides: Partial<Record<ShortcutId, string[]>>,
): KeyboardShortcutEntry | null {
  const proposed = new Set(
    proposedCombos.map((combo) => normalizeHotkey(combo)),
  );

  for (const entry of Object.values(KEYBOARD_SHORTCUTS)) {
    if (entry.id === targetId) continue;

    const combos = getEffectiveCombos(entry.id, overrides);
    for (const combo of combos) {
      if (proposed.has(normalizeHotkey(combo))) return entry;
    }
  }

  return null;
}
