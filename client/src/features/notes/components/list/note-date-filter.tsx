// !Will be used later — date range picker
import { Button } from '@/components/ui/button';

import { Calendar } from 'lucide-react';

interface NoteDateFilterProps {
   onStartDateChange: (val: string) => void;
   onEndDateChange: (val: string) => void;
   onResetFilters: () => void;
   showResetButton: boolean;
   startDate: string;
   endDate: string;
}

export function NoteDateFilter({
   onStartDateChange,
   onEndDateChange,
   showResetButton,
   onResetFilters,
   startDate,
   endDate,
}: NoteDateFilterProps) {
   return (
      <div className="flex items-center gap-3 px-6 pb-3">
         <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-1.5">
            <Calendar className="size-3.5 text-muted-foreground shrink-0" />
            <input
               type="date"
               value={startDate}
               onChange={(e) => onStartDateChange(e.target.value)}
               className="h-7 w-32 bg-transparent text-xs text-foreground outline-none border-none p-0 [color-scheme:dark]"
               placeholder="From"
            />
            <span className="text-xs text-muted-foreground">-</span>
            <input
               type="date"
               value={endDate}
               onChange={(e) => onEndDateChange(e.target.value)}
               className="h-7 w-32 bg-transparent text-xs text-foreground outline-none border-none p-0 [color-scheme:dark]"
               placeholder="To"
            />
         </div>

         {showResetButton && (
            <Button
               variant="ghost"
               size="xs"
               onClick={onResetFilters}
               className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
            >
               Reset Filters
            </Button>
         )}
      </div>
   );
}
