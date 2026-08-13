import type { ShortcutId } from '@/config/keyboard-shortcuts';

import { useMemo } from 'react';

import { useShortcutsStore } from '@/store/shortcuts-store';

import { getEffectiveCombos } from '@/config/keyboard-shortcuts';

export function useShortcut(id: ShortcutId) {
  const override = useShortcutsStore((state) => state.overrides[id]);

  return useMemo(() => {
    const combos = getEffectiveCombos(id, override ? { [id]: override } : {});

    return {
      combos,
    };
  }, [id, override]);
}
