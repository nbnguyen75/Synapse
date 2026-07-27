import { getSortOptionLabel, SORT_OPTIONS } from '@/features/notes/constants';

import { m } from '@/paraglide/messages';

import { FilterBar } from '@/components/common/filter-bar';

interface NotesHeaderProps {
   onSortChange: (value: string) => void;
   onCreateClick: () => void;
   sortBy: string;
}

export function NotesHeader({
   onCreateClick,
   onSortChange,
   sortBy,
}: NotesHeaderProps) {
   return (
      <FilterBar>
         <div className="ml-auto flex items-center gap-2">
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
         </div>
      </FilterBar>
   );
}
