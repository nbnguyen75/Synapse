import { useShortcutsStore } from '@/store/shortcuts-store';

import {
  EDITOR_SHORTCUT_GROUPS,
  KEYBOARD_SHORTCUT_SECTIONS,
  getShortcutsBySection,
} from '@/config/keyboard-shortcuts';

import { m } from '@/paraglide/messages';

import { Button } from '@/components/ui/button';

import { ShortcutRemapRow } from './shortcut-remap-row';

export default function ShortcutsSettingsPage() {
  const overrides = useShortcutsStore((state) => state.overrides);
  const resetAll = useShortcutsStore((state) => state.resetAll);

  const globalShortcuts = getShortcutsBySection('global');
  const editorShortcuts = getShortcutsBySection('editor');
  const editorGroups = [...new Set(editorShortcuts.map((s) => s.group))];
  const hasOverrides = Object.keys(overrides).length > 0;

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{m.settings_shortcuts_description()}</p>

        <Button
          variant="outline"
          size="sm"
          disabled={!hasOverrides}
          onClick={resetAll}
          className="h-8 shrink-0 text-xs"
        >
          {m.settings_shortcuts_reset_all()}
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">{KEYBOARD_SHORTCUT_SECTIONS.global.label()}</h2>

        <div className="space-y-2">
          {globalShortcuts.map((entry) => (
            <ShortcutRemapRow entry={entry} key={entry.id} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">{KEYBOARD_SHORTCUT_SECTIONS.editor.label()}</h2>

        <div className="space-y-3">
          {editorGroups.map((group) => (
            <div key={group} className="space-y-2">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {group && EDITOR_SHORTCUT_GROUPS[group].label()}
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {editorShortcuts
                  .filter((entry) => entry.group === group)
                  .map((entry) => (
                    <ShortcutRemapRow entry={entry} key={entry.id} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
