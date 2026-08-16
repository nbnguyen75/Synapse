import type { Hotkey, HotkeyRegistrationHandle } from '@tanstack/hotkeys';
import type { ShortcutId } from '@/config/keyboard-shortcuts';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';

import { getHotkeyManager } from '@tanstack/hotkeys';

import { useShortcutsStore } from '@/store/shortcuts-store';

import {
  getEffectiveCombos,
  getShortcut,
  getShortcutsBySection,
} from '@/config/keyboard-shortcuts';

interface GlobalShortcutRegistration {
  handler: (event: KeyboardEvent) => void;
  ignoreInputs: boolean;
  enabled: boolean;
}

interface GlobalShortcutsContextValue {
  register: (
    id: ShortcutId,
    registration: GlobalShortcutRegistration,
  ) => () => void;
}

const GlobalShortcutsContext =
  createContext<GlobalShortcutsContextValue | null>(null);

/**
 * Resolves the row options a hotkey registration should use given the
 * currently registered consumers. With no consumers the library defaults
 * apply (`ignoreInputs` per hotkey, `enabled: true`); with consumers, the
 * most permissive setting wins so shortcuts keep working while typing as
 * soon as any consumer asked for `allowWhenTyping`.
 */
function computeRowOptions(
  registrations: GlobalShortcutRegistration[] | undefined,
): { ignoreInputs: boolean | undefined; enabled: boolean } {
  if (!registrations || registrations.length === 0) {
    return { ignoreInputs: undefined, enabled: true };
  }
  return {
    ignoreInputs: registrations.every(
      (registration) => registration.ignoreInputs,
    ),
    enabled: registrations.some((registration) => registration.enabled),
  };
}

/**
 * Central listener for every `section: 'global'` shortcut in the registry.
 * Registers all global combos (effective, override-aware) exactly once via
 * the TanStack HotkeyManager and suppresses native browser behavior
 * (`preventDefault` + `stopPropagation`) so app shortcuts win over browser
 * ones (e.g. `mod+b` sidebar vs native bold, `mod+k` vs the browser find
 * bar). Consumers register their handlers through `useRegisterGlobalShortcut`
 * — handlers are invoked from refs at event time so closures stay fresh.
 */
export function GlobalShortcutsProvider({ children }: { children: ReactNode }) {
  const overrides = useShortcutsStore((state) => state.overrides);
  const registrationsRef = useRef(
    new Map<ShortcutId, GlobalShortcutRegistration[]>(),
  );
  const handlesRef = useRef(new Map<ShortcutId, HotkeyRegistrationHandle[]>());

  const syncRowOptions = useCallback((id: ShortcutId) => {
    const handles = handlesRef.current.get(id);
    if (!handles) return;
    const options = computeRowOptions(registrationsRef.current.get(id));
    for (const handle of handles) {
      handle.setOptions(options);
    }
  }, []);

  const register = useCallback(
    (id: ShortcutId, registration: GlobalShortcutRegistration) => {
      if (getShortcut(id).section !== 'global') {
        throw new Error(
          `GlobalShortcutsProvider: '${id}' is not a global shortcut`,
        );
      }

      const list = registrationsRef.current.get(id) ?? [];
      list.push(registration);
      registrationsRef.current.set(id, list);
      syncRowOptions(id);

      return () => {
        const current = registrationsRef.current.get(id) ?? [];
        const next = current.filter((item) => item !== registration);
        if (next.length === 0) {
          registrationsRef.current.delete(id);
        } else {
          registrationsRef.current.set(id, next);
        }
        syncRowOptions(id);
      };
    },
    [syncRowOptions],
  );

  useEffect(() => {
    const allHandles: HotkeyRegistrationHandle[] = [];
    const handlesByShortcut = new Map<ShortcutId, HotkeyRegistrationHandle[]>();

    for (const entry of getShortcutsBySection('global')) {
      const comboHandles: HotkeyRegistrationHandle[] = [];
      for (const combo of getEffectiveCombos(entry.id, overrides)) {
        const handle = getHotkeyManager().register(
          combo as Hotkey,
          (event) => {
            const registrations = registrationsRef.current.get(entry.id);
            if (!registrations) return;
            for (const registration of registrations) {
              if (registration.enabled) {
                registration.handler(event);
              }
            }
          },
          {
            meta: { name: entry.label() },
            conflictBehavior: 'allow',
            stopPropagation: true,
            preventDefault: true,
          },
        );
        comboHandles.push(handle);
        allHandles.push(handle);
      }
      if (comboHandles.length > 0) {
        handlesByShortcut.set(entry.id, comboHandles);
      }
    }

    handlesRef.current = handlesByShortcut;
    return () => {
      for (const handle of allHandles) {
        handle.unregister();
      }
      handlesRef.current = new Map();
    };
  }, [overrides]);

  useEffect(() => {
    for (const id of handlesRef.current.keys()) {
      syncRowOptions(id);
    }
  }, [overrides, syncRowOptions]);

  return (
    <GlobalShortcutsContext.Provider value={{ register }}>
      {children}
    </GlobalShortcutsContext.Provider>
  );
}

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
  const context = useContext(GlobalShortcutsContext);
  if (context === null) {
    throw new Error(
      'useRegisterGlobalShortcut must be used within <GlobalShortcutsProvider>',
    );
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
