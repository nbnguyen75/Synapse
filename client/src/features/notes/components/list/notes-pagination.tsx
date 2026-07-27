import { ListPagination } from '@/components/common/list-pagination';

interface NotesPaginationProps {
   onFirstPage: () => void;
   onPrevPage: () => void;
   onNextPage: () => void;
   onLastPage: () => void;
   isFirstPage: boolean;
   currentPage: number;
   isLastPage: boolean;
   totalPages: number;
}

export function NotesPagination(props: NotesPaginationProps) {
   return <ListPagination {...props} />;
}
