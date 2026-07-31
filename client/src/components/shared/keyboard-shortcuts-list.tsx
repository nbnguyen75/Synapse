import { useIsMac } from '@/hooks/use-is-os';

import {
  EDITOR_SHORTCUT_GROUPS,
  KEYBOARD_SHORTCUT_SECTIONS,
  getShortcutsBySection,
  type KeyboardShortcutEntry,
  type ShortcutSectionId,
} from '@/config/keyboard-shortcuts';

import { Kbd, KbdGroup } from '@/components/ui/kbd';

interface KeyboardShortcutsListProps {
  sections: ShortcutSectionId[];
}

function KeyCombo({ display }: { display: string[] }) {
  const isMac = useIsMac();
  const modLabel = isMac ? '⌘' : 'Ctrl';

  return (
    <KbdGroup>
      {display.map((key, i) => (
        <span key={`${key}-${i}`} className="flex items-center gap-1">
          <Kbd>{key === 'mod' ? modLabel : key}</Kbd>
          {i < display.length - 1 && (
            <span className="text-muted-foreground text-[10px]">+</span>
          )}
        </span>
      ))}
    </KbdGroup>
  );
}

function ShortcutRow({ entry }: { entry: KeyboardShortcutEntry }) {
  return (
    <div
      key={entry.id}
      className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border border-border/50"
    >
      <span className="text-muted-foreground">{entry.label()}</span>
      <KeyCombo display={entry.display} />
    </div>
  );
}

function renderEditorGroup(shortcuts: KeyboardShortcutEntry[]) {
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

export default function KeyboardShortcutsList({
  sections,
}: KeyboardShortcutsListProps) {
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
                : shortcuts.map((entry) => (
                    <ShortcutRow key={entry.id} entry={entry} />
                  ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
