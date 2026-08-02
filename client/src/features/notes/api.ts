import type {
  NoteCreateFormValues,
  NoteFormValues,
  NotesApiParams,
} from '@/features/notes/schemas';
import type { ApiResponse, PaginatedApiResponse } from '@/types/shared';
import type { Note } from '@/features/notes/types';

import { EMPTY_PAGINATED } from '@/features/notes/constants';

import { $fetch } from '@/lib/fetch';

export async function getNotes(params?: NotesApiParams) {
  try {
    const apiParams = params
      ? {
          ...params,
          page: params.page !== undefined ? params.page - 1 : undefined,
        }
      : undefined;

    const result = await $fetch<PaginatedApiResponse<Note>>('/api/v1/notes', {
      query: apiParams,
      method: 'GET',
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

export async function createNote(createNoteData: NoteCreateFormValues) {
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

const MAX_NOTE_CONTENT_LENGTH = 1500;

export async function generateNoteTitle(content: string) {
  const result = await $fetch<ApiResponse<{ title: string }>>(
    '/api/v1/ai/generator/note-title',
    {
      body: { content: content.slice(0, MAX_NOTE_CONTENT_LENGTH) },
      method: 'POST',
    },
  );

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data.title;
}

export async function deleteNote(id: string) {
  const result = await $fetch<ApiResponse<string>>(`/api/v1/notes/${id}`, {
    method: 'DELETE',
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  return id;
}

export async function togglePinNote(id: string) {
  const result = await $fetch<ApiResponse<Note>>(`/api/v1/notes/${id}/pin`, {
    method: 'PATCH',
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function toggleFavoriteNote(id: string) {
  const result = await $fetch<ApiResponse<Note>>(
    `/api/v1/notes/${id}/favorite`,
    { method: 'PATCH' },
  );

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function archiveNote(id: string) {
  const result = await $fetch<ApiResponse<Note>>(
    `/api/v1/notes/${id}/archive`,
    { method: 'PATCH' },
  );

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function unarchiveNote(id: string) {
  const result = await $fetch<ApiResponse<Note>>(
    `/api/v1/notes/${id}/unarchive`,
    { method: 'PATCH' },
  );

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function trashNote(id: string) {
  const result = await $fetch<ApiResponse<Note>>(`/api/v1/notes/${id}/trash`, {
    method: 'PATCH',
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function restoreNote(id: string) {
  const result = await $fetch<ApiResponse<Note>>(
    `/api/v1/notes/${id}/restore`,
    { method: 'PATCH' },
  );

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function emptyTrash() {
  const result = await $fetch<ApiResponse<string>>('/api/v1/notes/trash', {
    method: 'DELETE',
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  return 'Trash emptied';
}

interface BulkNoteRequest {
  ids: string[];
}

export async function bulkArchiveNotes(ids: string[]) {
  const result = await $fetch<ApiResponse<number>>(
    '/api/v1/notes/bulk/archive',
    { body: { ids } satisfies BulkNoteRequest, method: 'PATCH' },
  );

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function bulkUnarchiveNotes(ids: string[]) {
  const result = await $fetch<ApiResponse<number>>(
    '/api/v1/notes/bulk/unarchive',
    { body: { ids } satisfies BulkNoteRequest, method: 'PATCH' },
  );

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function bulkTrashNotes(ids: string[]) {
  const result = await $fetch<ApiResponse<number>>('/api/v1/notes/bulk/trash', {
    body: { ids } satisfies BulkNoteRequest,
    method: 'PATCH',
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function bulkRestoreNotes(ids: string[]) {
  const result = await $fetch<ApiResponse<number>>(
    '/api/v1/notes/bulk/restore',
    { body: { ids } satisfies BulkNoteRequest, method: 'PATCH' },
  );

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function bulkTogglePinNotes(ids: string[]) {
  const result = await $fetch<ApiResponse<number>>('/api/v1/notes/bulk/pin', {
    body: { ids } satisfies BulkNoteRequest,
    method: 'PATCH',
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function bulkToggleFavoriteNotes(ids: string[]) {
  const result = await $fetch<ApiResponse<number>>(
    '/api/v1/notes/bulk/favorite',
    { body: { ids } satisfies BulkNoteRequest, method: 'PATCH' },
  );

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function bulkDeletePermanent(ids: string[]) {
  const result = await $fetch<ApiResponse<number>>('/api/v1/notes/bulk', {
    body: { ids } satisfies BulkNoteRequest,
    method: 'DELETE',
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}
