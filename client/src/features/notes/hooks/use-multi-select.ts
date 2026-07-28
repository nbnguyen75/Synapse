import { useCallback, useState } from 'react';

export function useMultiSelect() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
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

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isAllSelected = useCallback(
    (ids: string[]) => ids.every((id) => selectedIds.has(id)),
    [selectedIds],
  );

  return {
    selectedCount: selectedIds.size,
    clearSelection,
    isAllSelected,
    toggleSelect,
    selectedIds,
    selectAll,
  };
}
