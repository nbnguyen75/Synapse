import type { PaginatedData } from '@/types/shared';
import type { Note } from '@/features/notes/types';

import { format } from 'date-fns';

import { m } from '@/paraglide/messages';

export const SORTABLE_FIELDS = [
  'updatedAt,desc',
  'updatedAt,asc',
  'createdAt,desc',
  'createdAt,asc',
  'title,desc',
  'title,asc',
] as const;

export const MAX_VISIBLE_TAGS = 3;

export const DEFAULT_NOTES_QUERY_PARAMS = {
  sort: 'updatedAt,desc' as const,
  pageSize: 20,
  page: 1,
  q: '',
};

export const VIEW_FILTERS = {
  favorites: { archived: false, trashed: false, favorite: true },
  active: { archived: false, trashed: false },
  archive: { archived: true, trashed: false },
  trash: { trashed: true },
} as const;

export const EMPTY_PAGINATED: PaginatedData<Note> = {
  totalElements: 0,
  totalPages: 1,
  isLast: true,
  items: [],
  size: 20,
  page: 0,
};

export function getSortItems(): {
  value: (typeof SORTABLE_FIELDS)[number];
  label: string;
}[] {
  return [
    { label: m.notes_page_sort_updated(), value: 'updatedAt,desc' },
    { label: m.notes_page_sort_updated_asc(), value: 'updatedAt,asc' },
    { label: m.notes_page_sort_created_new(), value: 'createdAt,desc' },
    { label: m.notes_page_sort_created_old(), value: 'createdAt,asc' },
    { label: m.notes_page_sort_title_az(), value: 'title,asc' },
    { label: m.notes_page_sort_title_za(), value: 'title,desc' },
  ];
}

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

export const MAX_NOTE_CONTENT_LENGTH = 1500;
