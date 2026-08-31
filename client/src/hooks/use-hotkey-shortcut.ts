import type { ShortcutId } from '@/config/keyboard-shortcuts';

import { useRegisterGlobalShortcut } from '@/providers/use-register-global-shortcut';

interface UseHotkeyShortcutOptions {
  allowWhenTyping?: boolean;
  enabled?: boolean;
}

/**
 * Binds a remappable global shortcut (registry default or user override) to a
 * handler through the central `GlobalShortcutsProvider`. The provider owns the
 * single TanStack HotkeyManager registration per combo (native browser
 * behavior suppressed via preventDefault/stopPropagation) and routes events to
 * registered handlers. `allowWhenTyping` maps to `ignoreInputs: false` so the
 * shortcut also fires while typing in inputs/contenteditable.
 */
export function useHotkeyShortcut(
  id: ShortcutId,
  handler: (event: KeyboardEvent) => void,
  { allowWhenTyping = false, enabled = true }: UseHotkeyShortcutOptions = {},
) {
  useRegisterGlobalShortcut(id, handler, { allowWhenTyping, enabled });
}
