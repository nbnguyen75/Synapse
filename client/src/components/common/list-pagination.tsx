import { m } from '@/paraglide/messages';

import { Button } from '@/components/ui/button';

import {
   ChevronsLeft,
   ChevronsRight,
   ChevronLeft,
   ChevronRight,
} from 'lucide-react';

interface ListPaginationProps {
   onFirstPage: () => void;
   onPrevPage: () => void;
   onNextPage: () => void;
   onLastPage: () => void;
   pageOfLabel?: string;
   isFirstPage: boolean;
   currentPage: number;
   isLastPage: boolean;
   totalPages: number;
}

export function ListPagination({
   currentPage,
   isFirstPage,
   onFirstPage,
   pageOfLabel,
   totalPages,
   isLastPage,
   onPrevPage,
   onNextPage,
   onLastPage,
}: ListPaginationProps) {
   return (
      <div className="flex items-center justify-center gap-4 border-t border-border px-6 py-3">
         <div className="flex items-center gap-1">
            <Button
               variant="outline"
               size="icon-xs"
               disabled={isFirstPage}
               onClick={onFirstPage}
            >
               <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
               variant="outline"
               size="icon-xs"
               disabled={isFirstPage}
               onClick={onPrevPage}
            >
               <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="min-w-17.5 text-center text-[11px] font-semibold text-foreground/70">
               {pageOfLabel ??
                  m.notes_page_page_of({
                     current: String(currentPage),
                     total: String(totalPages),
                  })}
            </span>
            <Button
               variant="outline"
               size="icon-xs"
               disabled={isLastPage}
               onClick={onNextPage}
            >
               <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
               variant="outline"
               size="icon-xs"
               disabled={isLastPage}
               onClick={onLastPage}
            >
               <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
         </div>
      </div>
   );
}
