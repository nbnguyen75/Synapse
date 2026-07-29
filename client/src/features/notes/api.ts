import type {
  NoteFormValues,
  NotesQueryParams,
} from '@/features/notes/schemas';
import type { ApiResponse, PaginatedApiResponse } from '@/types/shared';
import type { Note } from '@/features/notes/types';

import { EMPTY_PAGINATED } from '@/features/notes/constants';

import { $fetch } from '@/lib/fetch';

// TODO: support array query string later
export async function getNotes(params?: NotesQueryParams) {
  try {
    const result = await $fetch<PaginatedApiResponse<Note>>('/api/v1/notes', {
      method: 'GET',
      query: params,
    });

    if (!result.success) return EMPTY_PAGINATED;

    return result.data;
  } catch {
    return EMPTY_PAGINATED;
  }
}

export async function getNote(id: string) {
  const result = await $fetch<ApiResponse<Note>>(`/api/v1/notes/${id}`, {
    method: 'GET',
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function createNote(createNoteData: NoteFormValues) {
  const result = await $fetch<ApiResponse<Note>>('/api/v1/notes', {
    body: createNoteData,
    method: 'POST',
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function updateNote(id: string, updateNoteData: NoteFormValues) {
  const result = await $fetch<ApiResponse<Note>>(`/api/v1/notes/${id}`, {
    body: updateNoteData,
    method: 'PUT',
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function deleteNote(id: string) {
  const result = await $fetch<ApiResponse<string>>(`/api/notes/${id}`, {
    method: 'DELETE',
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  return id;
}
