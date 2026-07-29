import { getSortOptionLabel, SORT_OPTIONS } from '@/features/notes/constants';

import { m } from '@/paraglide/messages';

import { SearchInput } from '@/components/shared/search-input';
import { FilterBar } from '@/components/common/filter-bar';

interface NotesHeaderProps {
  onSearchChange?: (value: string) => void;
  onSortChange: (value: string) => void;
  onCreateClick: () => void;
  searchValue?: string;
  sortBy: string;
}

export function NotesHeader({
  onSearchChange,
  onCreateClick,
  onSortChange,
  searchValue,
  sortBy,
}: NotesHeaderProps) {
  return (
    <FilterBar>
      {/* {onSearchChange && (
        <SearchInput
          defaultValue={searchValue}
          onSearch={onSearchChange}
          placeholder={m.notes_page_search_placeholder()}
          className="w-64"
        />
      )} */}
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
