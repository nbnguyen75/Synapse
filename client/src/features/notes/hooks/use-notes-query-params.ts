import type { NotesQueryParams } from '@/features/notes/schemas';

import { useNavigate, useSearch } from '@tanstack/react-router';

import { DEFAULT_NOTES_QUERY_PARAMS } from '@/features/notes/constants';

export function useNotesQueryParams() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/_app/notes/' });

  const { q: query, sort, page } = search;

  const sortValue = sort ?? DEFAULT_NOTES_QUERY_PARAMS.sort;
  const pageValue = page ?? DEFAULT_NOTES_QUERY_PARAMS.page;

  const setPage = (newPage: number) => {
    void navigate({
      search: (prev) => ({ ...prev, page: newPage }),
      to: '.',
    });
  };

  const setSort = (newSort?: NotesQueryParams['sort']) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        sort: newSort,
        page: 1,
      }),
      to: '.',
    });
  };

  return { page: pageValue, sortValue, setPage, setSort, search, query, sort };
}
