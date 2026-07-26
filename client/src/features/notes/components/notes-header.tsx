import { getSortOptionLabel, SORT_OPTIONS } from '@/features/notes/constants';
import { ListFilterBar } from '@/features/notes/components/list-filter-bar';

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
      <ListFilterBar
         onFilterToggle={onToggleFilter}
         onSearchChange={onSearchChange}
         onSortChange={onSortChange}
         onCreateClick={onCreateClick}
         onViewChange={onViewChange}
         isFilterOpen={isFilterOpen}
         searchValue={searchValue}
         sortBy={sortBy}
         view={view}
         sortOptions={SORT_OPTIONS}
         getSortLabel={getSortOptionLabel}
         createLabel={m.notes_page_create()}
         searchPlaceholder={m.notes_page_search_placeholder()}
      />
   );
}
