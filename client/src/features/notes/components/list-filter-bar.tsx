import { m } from '@/paraglide/messages';

import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
   Plus,
   Search,
   SlidersHorizontal,
   Archive,
   FileText,
   X,
} from 'lucide-react';

interface SortOption {
   value: string;
   key: string;
}

interface ListFilterBarProps {
   onViewChange?: (view: 'active' | 'archived') => void;
   onSearchChange: (value: string) => void;
   onSortChange: (value: string) => void;
   getSortLabel: (key: string) => string;

   sortOptions: readonly SortOption[];
   view?: 'active' | 'archived';
   onFilterToggle: () => void;
   onCreateClick: () => void;
   searchPlaceholder: string;
   isFilterOpen: boolean;
   searchValue: string;

   createLabel: string;
   sortBy: string;
}

export function ListFilterBar({
   searchPlaceholder,
   onFilterToggle,
   onSearchChange,
   onCreateClick,
   onSortChange,
   isFilterOpen,
   onViewChange,
   getSortLabel,
   searchValue,
   sortOptions,
   createLabel,
   sortBy,
   view,
}: ListFilterBarProps) {
   return (
      <div className="flex items-center gap-3 border-b px-6 py-3 overflow-x-auto no-scrollbar">
         <Button
            variant="ghost"
            size="icon-sm"
            onClick={onFilterToggle}
            className={isFilterOpen ? 'text-primary' : 'text-muted-foreground'}
            title={
               isFilterOpen
                  ? m.notes_page_filter_hide()
                  : m.notes_page_filter_show()
            }
         >
            <SlidersHorizontal className="size-4" />
         </Button>

         <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
               value={searchValue}
               onChange={(e) => onSearchChange(e.target.value)}
               placeholder={searchPlaceholder}
               className="h-9 pl-9 pr-8 rounded-lg text-sm"
            />
            {searchValue && (
               <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
               >
                  <X className="size-4" />
               </button>
            )}
         </div>

         {onViewChange && view && (
            <div className="hidden md:flex items-center gap-1 rounded-lg border p-0.5">
               <Button
                  variant={view === 'active' ? 'secondary' : 'ghost'}
                  size="xs"
                  onClick={() => onViewChange('active')}
                  className="text-xs"
               >
                  <FileText className="mr-1 size-3.5" />
                  {m.notes_page_view_active()}
               </Button>
               <Button
                  variant={view === 'archived' ? 'secondary' : 'ghost'}
                  size="xs"
                  onClick={() => onViewChange('archived')}
                  className="text-xs"
               >
                  <Archive className="mr-1 size-3.5" />
                  {m.notes_page_view_archived()}
               </Button>
            </div>
         )}

         <div className="hidden md:block">
            <Select
               value={sortBy}
               onValueChange={(v) => {
                  if (v !== null) onSortChange(v);
               }}
            >
               <SelectTrigger className="w-36 h-9 text-xs rounded-lg">
                  <SelectValue />
               </SelectTrigger>
               <SelectContent>
                  {sortOptions.map((opt) => (
                     <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-xs"
                     >
                        {getSortLabel(opt.key)}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </div>

         <Button
            size="sm"
            className="hidden md:inline-flex shrink-0 h-9"
            onClick={onCreateClick}
         >
            <Plus className="mr-1 size-4" />
            {createLabel}
         </Button>
      </div>
   );
}
