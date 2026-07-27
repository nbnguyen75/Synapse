import { getSortOptionLabel, SORT_OPTIONS } from '@/features/notes/constants';

import { m } from '@/paraglide/messages';

import { FilterBar } from '@/components/common/filter-bar';

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
      <FilterBar>
         <FilterBar.FilterToggle
            isOpen={isFilterOpen}
            onClick={onToggleFilter}
            title={
               isFilterOpen
                  ? m.notes_page_filter_hide()
                  : m.notes_page_filter_show()
            }
         />
         <FilterBar.Search
            value={searchValue}
            onChange={onSearchChange}
            placeholder={m.notes_page_search_placeholder()}
         />
         <FilterBar.ViewToggle
            view={view}
            onChange={onViewChange}
            activeLabel={m.notes_page_view_active()}
            archivedLabel={m.notes_page_view_archived()}
         />
         <FilterBar.Sort
            value={sortBy}
            onChange={onSortChange}
            options={SORT_OPTIONS}
            getLabel={getSortOptionLabel}
         />
         <FilterBar.CreateButton
            onClick={onCreateClick}
            label={m.notes_page_create()}
         />
      </FilterBar>
   );
}
