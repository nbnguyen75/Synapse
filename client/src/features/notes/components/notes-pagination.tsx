import { Button } from '@/shared/components/ui/button';

import {
   ChevronsLeft,
   ChevronsRight,
   ChevronLeft,
   ChevronRight,
} from 'lucide-react';

import { m } from '@/paraglide/messages';

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

export function NotesPagination({
   onPageSizeChange,
   currentPage,
   isFirstPage,
   onFirstPage,
   totalPages,
   totalItems,
   startIndex,
   isLastPage,
   onPrevPage,
   onNextPage,
   onLastPage,
   endIndex,
   pageSize,
}: NotesPaginationProps) {
   return (
      <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-6 py-3 sm:flex-row">
         <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-muted-foreground">
               {m.notes_page_per_page()}
            </span>
            <div className="flex gap-0.5 rounded-lg border border-border/40 bg-muted p-0.5">
               {([10, 20, 50, 100] as const).map((size) => (
                  <Button
                     key={size}
                     variant="ghost"
                     size="xs"
                     type="button"
                     onClick={() => onPageSizeChange(size)}
                     className={`cursor-pointer ${
                        pageSize === size
                           ? 'bg-background text-primary shadow-xs'
                           : ''
                     }`}
                  >
                     {size}
                  </Button>
               ))}
            </div>
         </div>
         <div className="flex items-center gap-4">
            <span className="text-[11px] font-medium text-muted-foreground">
               {m.notes_page_showing({
                  from: String(totalItems === 0 ? 0 : startIndex + 1),
                  to: String(Math.min(endIndex, totalItems)),
                  total: String(totalItems),
               })}
            </span>
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
               <span className="min-w-[70px] text-center text-[11px] font-semibold text-foreground/70">
                  {m.notes_page_page_of({
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
      </div>
   );
}
