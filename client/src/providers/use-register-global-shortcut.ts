import type { ShortcutId } from '@/config/keyboard-shortcuts';

import { createContext, use, useEffect } from 'react';

export interface GlobalShortcutRegistration {
  handler: (event: KeyboardEvent) => void;
  ignoreInputs: boolean;
  enabled: boolean;
}

export interface GlobalShortcutsContextValue {
  register: (id: ShortcutId, registration: GlobalShortcutRegistration) => () => void;
}

export const GlobalShortcutsContext = createContext<GlobalShortcutsContextValue | null>(null);

interface UseGlobalShortcutOptions {
  allowWhenTyping?: boolean;
  enabled?: boolean;
}

/**
 * Registers a handler for a global shortcut into the central
 * `GlobalShortcutsProvider`. The handler ref is kept fresh on every render,
 * so callers always dispatch the latest closure.
 */
export function useRegisterGlobalShortcut(
  id: ShortcutId,
  handler: (event: KeyboardEvent) => void,
  { allowWhenTyping = false, enabled = true }: UseGlobalShortcutOptions = {},
) {
  const context = use(GlobalShortcutsContext);
  if (context === null) {
    throw new Error('useRegisterGlobalShortcut must be used within <GlobalShortcutsProvider>');
  }
  const { register } = context;

  useEffect(() => {
    return register(id, {
      ignoreInputs: !allowWhenTyping,
      handler,
      enabled,
    });
  }, [allowWhenTyping, enabled, handler, id, register]);
}
