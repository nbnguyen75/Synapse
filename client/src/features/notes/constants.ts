import type { PaginatedData } from '@/types/shared';
import type { Note } from '@/features/notes/types';

import { format } from 'date-fns';

import { m } from '@/paraglide/messages';

export const SORTABLE_FIELDS = ['updatedAt', 'createdAt', 'title'] as const;

export const MAX_VISIBLE_TAGS = 3;

export const DEFAULT_NOTES_QUERY_PARAMS = {
  sort: 'updatedAt' as const,
  pageSize: 10,
  page: 1,
  q: '',
};

export const EMPTY_PAGINATED: PaginatedData<Note> = {
  totalElements: 0,
  totalPages: 1,
  isLast: true,
  items: [],
  size: 10,
  page: 1,
};

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'MMM d, yyyy');
}

export const SORT_OPTIONS = [
  { value: 'updatedAt_desc', key: 'updated' },
  { value: 'createdAt_desc', key: 'createdNew' },
  { value: 'createdAt_asc', key: 'createdOld' },
  { value: 'title_asc', key: 'titleAz' },
  { value: 'title_desc', key: 'titleZa' },
  { value: 'readTime_desc', key: 'readLong' },
  { value: 'readTime_asc', key: 'readShort' },
] as const;

export function getSortOptionLabel(key: string): string {
  switch (key) {
    case 'updated':
      return m.notes_page_sort_updated();
    case 'createdNew':
      return m.notes_page_sort_created_new();
    case 'createdOld':
      return m.notes_page_sort_created_old();
    case 'titleAz':
      return m.notes_page_sort_title_az();
    case 'titleZa':
      return m.notes_page_sort_title_za();
    case 'readLong':
      return m.notes_page_sort_read_long();
    case 'readShort':
      return m.notes_page_sort_read_short();
    default:
      return key;
  }
}
