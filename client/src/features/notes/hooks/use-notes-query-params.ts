import type { NotesQueryParams } from '@/features/notes/schemas';

import { useNavigate, useSearch } from '@tanstack/react-router';

export function useNotesQueryParams() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/_app/notes/_list' });

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

  return {
    setPage,
    setSort,
    search,
  };
}
