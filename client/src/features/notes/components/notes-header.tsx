import { SORT_OPTIONS } from '@/features/notes/constants';

import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

import {
   Plus,
   Search,
   SlidersHorizontal,
   Archive,
   FileText,
} from 'lucide-react';

import { m } from '@/paraglide/messages';

interface NotesHeaderProps {
   onViewChange: (view: 'active' | 'archived') => void;
   onSearchChange: (value: string) => void;
   onSortChange: (value: string) => void;
   view: 'active' | 'archived';
   onToggleFilter: () => void;
   onCreateClick: () => void;
   isFilterOpen: boolean;
   searchValue: string;
   sortBy: string;
}

export function NotesHeader({
   onSearchChange,
   onToggleFilter,
   onCreateClick,
   onSortChange,
   isFilterOpen,
   onViewChange,
   searchValue,
   sortBy,
   view,
}: NotesHeaderProps) {
   return (
      <div className="flex items-center gap-3 border-b px-6 py-3 overflow-x-auto no-scrollbar">
         <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleFilter}
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
               placeholder={m.notes_page_search_placeholder()}
               className="h-9 pl-9 rounded-lg text-sm"
            />
         </div>

         <div className="flex items-center gap-1 rounded-lg border p-0.5">
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
               {SORT_OPTIONS.map((opt) => (
                  <SelectItem
                     key={opt.value}
                     value={opt.value}
                     className="text-xs"
                  >
                     {m[opt.labelKey]()}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>

         <Button size="sm" className="shrink-0 h-9" onClick={onCreateClick}>
            <Plus className="mr-1 size-4" />
            {m.notes_page_create()}
         </Button>
      </div>
   );
}
