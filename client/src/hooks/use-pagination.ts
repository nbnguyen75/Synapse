import { useCallback, useState } from 'react';

interface UsePaginationOptions {
  onPageChange?: (page: number) => void;
  initialSize?: number;
  initialPage?: number;
  currentPage?: number;
  totalItems?: number;
  totalPages?: number;
}

export interface UsePaginationReturn {
  setPageSize: (size: number) => void;
  goToPage: (page: number) => void;
  firstPage: () => void;
  isFirstPage: boolean;
  nextPage: () => void;
  prevPage: () => void;
  lastPage: () => void;
  currentPage: number;
  isLastPage: boolean;
  totalPages: number;
  startIndex: number;
  totalItems: number;
  pageSize: number;
  endIndex: number;
}

export function usePagination({
  totalPages: controlledTotalPages,
  currentPage: controlledPage,
  initialSize = 10,
  initialPage = 1,
  totalItems = 0,
  onPageChange,
}: UsePaginationOptions): UsePaginationReturn {
  const [internalPage, setInternalPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialSize);

  const isControlled = controlledPage !== undefined;
  const currentPage = isControlled ? controlledPage : internalPage;
  const totalPages =
    controlledTotalPages ?? Math.max(1, Math.ceil(totalItems / pageSize));
  const effectiveCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (effectiveCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const navigateTo = useCallback(
    (page: number) => {
      const target = Math.max(1, Math.min(page, totalPages));
      if (isControlled) {
        onPageChange?.(target);
      } else {
        setInternalPage(target);
      }
    },
    [isControlled, onPageChange, totalPages],
  );

  const goToPage = useCallback(
    (page: number) => navigateTo(page),
    [navigateTo],
  );

  const nextPage = useCallback(
    () => navigateTo(currentPage + 1),
    [navigateTo, currentPage],
  );

  const prevPage = useCallback(
    () => navigateTo(currentPage - 1),
    [navigateTo, currentPage],
  );

  const firstPage = useCallback(() => navigateTo(1), [navigateTo]);

  const lastPage = useCallback(
    () => navigateTo(totalPages),
    [navigateTo, totalPages],
  );

  return {
    isLastPage: effectiveCurrentPage === totalPages,
    isFirstPage: effectiveCurrentPage === 1,
    currentPage: effectiveCurrentPage,
    setPageSize,
    totalPages,
    startIndex,
    totalItems,
    firstPage,
    pageSize,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    lastPage,
  };
}
