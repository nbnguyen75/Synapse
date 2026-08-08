import type {
  Note,
  NotesEmptyVariant,
  NoteViewMode,
} from '@/features/notes/types';
import type { PaginatedData } from '@/types/response';

import { m } from '@/paraglide/messages';

export const NOTE_BULK_ACTIONS = [
  'PIN',
  'UNPIN',
  'FAVORITE',
  'UNFAVORITE',
  'ARCHIVE',
  'UNARCHIVE',
  'TRASH',
  'RESTORE',
  'DELETE_PERMANENT',
] as const;

export type BulkNoteAction = (typeof NOTE_BULK_ACTIONS)[number];

export const NOTE_SORTABLE_FIELDS = [
  'updatedAt,desc',
  'updatedAt,asc',
  'createdAt,desc',
  'createdAt,asc',
  'title,desc',
  'title,asc',
] as const;

export type NoteSortableField = (typeof NOTE_SORTABLE_FIELDS)[number];

export const NOTE_VIEW_FILTERS = {
  favorites: { archived: false, trashed: false, favorite: true },
  active: { archived: false, trashed: false },
  archive: { archived: true, trashed: false },
  trash: { trashed: true },
} as const;

export const DEFAULT_NOTES_QUERY_PARAMS = {
  sort: 'updatedAt,desc' as const,
  pageSize: 20,
  page: 1,
  q: '',
};

export const EMPTY_PAGINATED: PaginatedData<Note> = {
  totalElements: 0,
  totalPages: 1,
  isLast: true,
  items: [],
  size: 20,
  page: 0,
};

export const NOTE_SORT_OPTIONS: { value: NoteSortableField; label: string }[] =
  [
    { label: m.notes_page_sort_updated(), value: 'updatedAt,desc' },
    { label: m.notes_page_sort_updated_asc(), value: 'updatedAt,asc' },
    { label: m.notes_page_sort_created_new(), value: 'createdAt,desc' },
    { label: m.notes_page_sort_created_old(), value: 'createdAt,asc' },
    { label: m.notes_page_sort_title_az(), value: 'title,asc' },
    { label: m.notes_page_sort_title_za(), value: 'title,desc' },
  ];

interface NotesViewConfig {
  filters: { archived?: boolean; favorite?: boolean; trashed?: boolean };
  description: (count: string) => string;
  emptyVariant: NotesEmptyVariant;
  title: () => string;
}

export const NOTE_VIEW_CONFIG: Record<NoteViewMode, NotesViewConfig> = {
  favorites: {
    description: (count) => m.favorites_page_title_desc({ count }),
    title: () => '⭐ ' + m.favorites_page_title(),
    filters: NOTE_VIEW_FILTERS.favorites,
    emptyVariant: 'favorites',
  },
  archive: {
    description: (count) => m.archive_page_title_desc({ count }),
    title: () => '📦 ' + m.archive_page_title(),
    filters: NOTE_VIEW_FILTERS.archive,
    emptyVariant: 'archived',
  },
  active: {
    description: (count) => m.notes_page_view_desc({ count }),
    title: () => '📝 ' + m.notes_page_title(),
    filters: NOTE_VIEW_FILTERS.active,
    emptyVariant: 'active',
  },
  trash: {
    description: (count) => m.trash_page_title_desc({ count }),
    title: () => '🗑️ ' + m.trash_page_title(),
    filters: NOTE_VIEW_FILTERS.trash,
    emptyVariant: 'trash',
  },
};

export const BULK_NOTES_ACTION_SUCCESS_MESSAGE: Record<BulkNoteAction, string> =
  {
    DELETE_PERMANENT: m.notes_page_toast_deleted(),
    UNFAVORITE: m.notes_page_toast_unfavorited(),
    UNARCHIVE: m.notes_page_toast_unarchived(),
    FAVORITE: m.notes_page_toast_favorited(),
    ARCHIVE: m.notes_page_toast_archived(),
    RESTORE: m.notes_page_toast_restored(),
    UNPIN: m.notes_page_toast_unpinned(),
    TRASH: m.notes_page_toast_trashed(),
    PIN: m.notes_page_toast_pinned(),
  };
