import type { ShortcutId } from '@/config/keyboard-shortcuts';
import type { Hotkey } from '@tanstack/hotkeys';

import { useHotkeys } from '@tanstack/react-hotkeys';

import { useShortcut } from '@/hooks/use-shortcut';

import { getShortcut } from '@/config/keyboard-shortcuts';

interface UseHotkeyShortcutOptions {
  allowWhenTyping?: boolean;
  enabled?: boolean;
}

/**
 * Binds a remappable shortcut (registry default or user override) to a handler
 * via TanStack Hotkeys. The `mod` token resolves cross-platform, combos are
 * matched case-insensitively, and callbacks are synced on every render so the
 * latest closure is always used. `allowWhenTyping` maps to `ignoreInputs: false`
 * so the shortcut also fires while typing in inputs/contenteditable.
 */
export function useHotkeyShortcut(
  id: ShortcutId,
  handler: (event: KeyboardEvent) => void,
  { allowWhenTyping = false, enabled = true }: UseHotkeyShortcutOptions = {},
) {
  const { combos } = useShortcut(id);
  const meta = { name: getShortcut(id).label() };

  useHotkeys(
    combos.map((combo) => ({
      options: {
        ignoreInputs: !allowWhenTyping,
        enabled,
        meta,
      },
      hotkey: combo as Hotkey,
      callback: handler,
    })),
  );
}
