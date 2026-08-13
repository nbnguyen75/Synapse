import type { NotesApiParams } from '@/features/notes/types';

export const noteKeys = {
  infiniteList: (params?: Omit<NotesApiParams, 'page'>) =>
    [...noteKeys.infinites(), params] as const,
  list: (params?: NotesApiParams) => [...noteKeys.lists(), params] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
  infinites: () => [...noteKeys.all, 'infinite'] as const,
  details: () => [...noteKeys.all, 'detail'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  all: ['notes'] as const,
};
