import { ListPagination } from '@/features/notes/components/list-pagination';

interface NotesPaginationProps {
   onPageSizeChange: (size: number) => void;
   onFirstPage: () => void;
   onPrevPage: () => void;
   onNextPage: () => void;
   onLastPage: () => void;
   isFirstPage: boolean;
   currentPage: number;
   isLastPage: boolean;
   totalPages: number;
   totalItems: number;
   startIndex: number;
   endIndex: number;
   pageSize: number;
}

export function NotesPagination(props: NotesPaginationProps) {
   return <ListPagination {...props} />;
}
