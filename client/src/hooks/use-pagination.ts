import { useCallback, useState } from 'react';

interface UsePaginationOptions {
   initialSize?: number;
   initialPage?: number;
   totalItems: number;
}

interface UsePaginationReturn {
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
   initialSize = 10,
   initialPage = 1,
   totalItems,
}: UsePaginationOptions): UsePaginationReturn {
   const [currentPage, setCurrentPage] = useState(initialPage);
   const [pageSize, setPageSize] = useState(initialSize);

   const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
   const effectiveCurrentPage = Math.min(currentPage, totalPages);
   const startIndex = (effectiveCurrentPage - 1) * pageSize;
   const endIndex = Math.min(startIndex + pageSize, totalItems);

   const goToPage = useCallback(
      (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages))),
      [totalPages],
   );

   const nextPage = useCallback(
      () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
      [totalPages],
   );

   const prevPage = useCallback(
      () => setCurrentPage((p) => Math.max(p - 1, 1)),
      [],
   );

   const firstPage = useCallback(() => setCurrentPage(1), []);

   const lastPage = useCallback(() => setCurrentPage(totalPages), [totalPages]);

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
