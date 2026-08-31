import type { KeyboardShortcutEntry, ShortcutSectionId } from '@/config/keyboard-shortcuts';

import { useShortcut } from '@/hooks/use-shortcut';

import {
  EDITOR_SHORTCUT_GROUPS,
  KEYBOARD_SHORTCUT_SECTIONS,
  getShortcutsBySection,
} from '@/config/keyboard-shortcuts';

import { m } from '@/paraglide/messages';

import { KeyCombo } from '@/components/shared/key-combo';

interface KeyboardShortcutsListProps {
  sections: Array<ShortcutSectionId>;
}

function ShortcutRow({ entry }: { entry: KeyboardShortcutEntry }) {
  const { combos } = useShortcut(entry.id);

  return (
    <div
      key={entry.id}
      className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border border-border/50"
    >
      <span className="text-muted-foreground">{entry.label()}</span>
      {combos.length > 0 ? (
        <KeyCombo combo={combos[0]} />
      ) : (
        <span className="text-xs text-muted-foreground">{m.settings_shortcuts_disabled()}</span>
      )}
    </div>
  );
}

function renderEditorGroup(shortcuts: Array<KeyboardShortcutEntry>) {
  const groups = [...new Set(shortcuts.map((entry) => entry.group))];

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group}>
          <h5 className="font-semibold text-foreground text-xs mb-2">
            {group && EDITOR_SHORTCUT_GROUPS[group].label()}
          </h5>
          <div className="grid grid-cols-2 gap-2">
            {shortcuts
              .filter((entry) => entry.group === group)
              .map((entry) => (
                <ShortcutRow key={entry.id} entry={entry} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function KeyboardShortcutsList({ sections }: KeyboardShortcutsListProps) {
  return (
    <div className="space-y-5 pt-2 text-xs">
      {sections.map((section) => {
        const shortcuts = getShortcutsBySection(section);
        if (!shortcuts.length) return null;

        return (
          <div key={section}>
            <h4 className="font-semibold text-foreground text-xs mb-2 uppercase tracking-wider">
              {KEYBOARD_SHORTCUT_SECTIONS[section].label()}
            </h4>
            <div className="space-y-1">
              {section === 'editor'
                ? renderEditorGroup(shortcuts)
                : shortcuts.map((entry) => <ShortcutRow key={entry.id} entry={entry} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
