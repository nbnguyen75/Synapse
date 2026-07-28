import type {
  EditableNoteData,
  Note,
  NotesSearchParams,
} from '@/features/notes/types';
import type { ApiResponse, PaginatedApiResponse } from '@/types/shared';

import { $fetch } from '@/lib/fetch';

export async function getNotes(params?: NotesSearchParams): Promise<Note[]> {
  try {
    if (params) {
      const url = buildNotesUrl(params);
      const result = await $fetch<PaginatedApiResponse<Note>>(url);

      if (!result.success) return [];

      return result.data.items;
    }

    const result = await $fetch<ApiResponse<Note[]>>('/api/v1/notes');

    if (!result.success) return [];

    return result.data;
  } catch {
    return [];
  }
}

function buildNotesUrl(params: NotesSearchParams): string {
  const apiParams: Record<string, string> = {};

  if (params.q) apiParams.q = params.q;
  if (params.sort) apiParams.sort = params.sort.replace('_', ',');
  if (params.page !== undefined)
    apiParams.page = String(Math.max(0, params.page - 1));
  if (params.pageSize) apiParams.size = String(params.pageSize);
  if (params.tag) apiParams.tag = params.tag;
  if (params.startDate) apiParams.startDate = params.startDate;
  if (params.endDate) apiParams.endDate = params.endDate;
  if (params.view) apiParams.view = params.view;

  const qs = new URLSearchParams(apiParams).toString();
  return qs ? `/api/v1/notes?${qs}` : '/api/v1/notes';
}

export async function getNote(id: string) {
  const result = await $fetch<ApiResponse<Note>>(`/api/v1/notes/${id}`);

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function createNote(createNoteData: EditableNoteData) {
  const result = await $fetch<ApiResponse<Note>>('/api/v1/notes', {
    body: createNoteData,
    method: 'POST',
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function updateNote(id: string, updateNoteData: EditableNoteData) {
  const result = await $fetch<ApiResponse<Note>>(`/api/v1/notes/${id}`, {
    body: updateNoteData,
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
