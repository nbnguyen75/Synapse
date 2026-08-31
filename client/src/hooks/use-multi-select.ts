import { useCallback, useRef, useState } from 'react';

export function useMultiSelect() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const lastClickedIdRef = useRef<string | null>(null);

  const toggleSelect = useCallback((id: string) => {
    lastClickedIdRef.current = id;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectRange = useCallback(
    (id: string, orderedIds: Array<string>) => {
      const anchor = lastClickedIdRef.current ?? id;
      const anchorIdx = orderedIds.indexOf(anchor);
      const currentIdx = orderedIds.indexOf(id);
      if (anchorIdx === -1 || currentIdx === -1) {
        toggleSelect(id);
        return;
      }
      const [start, end] =
        anchorIdx <= currentIdx ? [anchorIdx, currentIdx] : [currentIdx, anchorIdx];

      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (let i = start; i <= end; i++) {
          next.add(orderedIds[i]);
        }
        return next;
      });
      lastClickedIdRef.current = id;
    },
    [toggleSelect],
  );

  const setSelected = useCallback((ids: Array<string>) => {
    setSelectedIds(new Set(ids));
  }, []);

  const selectAll = useCallback((ids: Array<string>) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    lastClickedIdRef.current = null;
  }, []);

  const isAllSelected = useCallback(
    (ids: Array<string>) => ids.every((id) => selectedIds.has(id)),
    [selectedIds],
  );

  return {
    selectedCount: selectedIds.size,
    toggleSelectRange,
    clearSelection,
    isAllSelected,
    toggleSelect,
    selectedIds,
    setSelected,
    selectAll,
  };
}
