import type { ShortcutId } from '@/config/keyboard-shortcuts';
import type { Hotkey } from '@tanstack/hotkeys';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';

import { getHotkeyManager, getSequenceManager } from '@tanstack/hotkeys';

import { useShortcutsStore } from '@/store/shortcuts-store';

import {
  getEffectiveCombos,
  getShortcut,
  getShortcutsBySection,
} from '@/config/keyboard-shortcuts';

import {
  GlobalShortcutsContext,
  type GlobalShortcutRegistration,
} from './use-register-global-shortcut';

/**
 * Structural handle shared by `HotkeyRegistrationHandle` and
 * `SequenceRegistrationHandle` — both expose `setOptions`/`unregister` with
 * the same shape for the options we manage.
 */
interface HotkeyHandleLike {
  setOptions(options: { ignoreInputs?: boolean; enabled?: boolean }): void;
  unregister(): void;
}

/**
 * Resolves the row options a hotkey registration should use given the
 * currently registered consumers. With no consumers the library defaults
 * apply (`ignoreInputs` per hotkey, `enabled: true`); with consumers, the
 * most permissive setting wins so shortcuts keep working while typing as
 * soon as any consumer asked for `allowWhenTyping`.
 */
function computeRowOptions(registrations: GlobalShortcutRegistration[] | undefined): {
  ignoreInputs: undefined | boolean;
  enabled: boolean;
} {
  if (!registrations || registrations.length === 0) {
    return { ignoreInputs: undefined, enabled: true };
  }
  return {
    ignoreInputs: registrations.every((registration) => registration.ignoreInputs),
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
  const registrationsRef = useRef(new Map<ShortcutId, GlobalShortcutRegistration[]>());
  const handlesRef = useRef(new Map<ShortcutId, HotkeyHandleLike[]>());

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
        throw new Error(`GlobalShortcutsProvider: '${id}' is not a global shortcut`);
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
    const allHandles: HotkeyHandleLike[] = [];
    const handlesByShortcut = new Map<ShortcutId, HotkeyHandleLike[]>();

    for (const entry of getShortcutsBySection('global')) {
      const comboHandles: HotkeyHandleLike[] = [];
      for (const combo of getEffectiveCombos(entry.id, overrides)) {
        const invoke = (event: KeyboardEvent) => {
          const registrations = registrationsRef.current.get(entry.id);
          if (!registrations) return;
          for (const registration of registrations) {
            if (registration.enabled) {
              registration.handler(event);
            }
          }
        };

        // Multi-key sequences (e.g. `g n`) go through the SequenceManager,
        // which has its own listener + timeout state machine; single combos
        // register on the HotkeyManager. The registry stores combos as plain
        // strings that the library parses at runtime, so they are narrowed at
        // this boundary.
        const isSequence = combo.includes(' ');
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        const sequenceSteps = combo.split(/\s+/) as Hotkey[];
        const handle = isSequence
          ? getSequenceManager().register(sequenceSteps, invoke, {
              meta: { name: entry.label() },
              conflictBehavior: 'allow',
              stopPropagation: true,
              preventDefault: true,
            })
          : // oxlint-disable-next-line typescript/no-unsafe-type-assertion
            getHotkeyManager().register(combo as Hotkey, invoke, {
              meta: { name: entry.label() },
              conflictBehavior: 'allow',
              stopPropagation: true,
              preventDefault: true,
            });
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

  return <GlobalShortcutsContext value={{ register }}>{children}</GlobalShortcutsContext>;
}
