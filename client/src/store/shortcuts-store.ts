import type { ShortcutId } from '@/config/keyboard-shortcuts';

import { persist } from 'zustand/middleware';
import { create } from 'zustand';

interface ShortcutsState {
  setBinding: (id: ShortcutId, combos: Array<string> | null) => void;
  /** Non-default bindings only. An empty array disables the shortcut. */
  overrides: Partial<Record<ShortcutId, Array<string>>>;
  resetBinding: (id: ShortcutId) => void;
  resetAll: () => void;
}

export const useShortcutsStore = create<ShortcutsState>()(
  persist(
    (set) => ({
      setBinding: (id, combos) =>
        set((state) => {
          const next = { ...state.overrides };
          if (combos === null) {
            delete next[id];
          } else {
            next[id] = combos;
          }
          return { overrides: next };
        }),
      resetBinding: (id) =>
        set((state) => {
          const next = { ...state.overrides };
          delete next[id];
          return { overrides: next };
        }),
      resetAll: () => set({ overrides: {} }),
      overrides: {},
    }),
    {
      partialize: (state) => ({ overrides: state.overrides }),
      name: 'synapse-shortcuts',
      version: 1,
    },
  ),
);
