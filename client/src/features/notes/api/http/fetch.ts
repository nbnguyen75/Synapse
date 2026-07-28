import type { EditableNoteData, Note } from '@/features/notes/types';
import type { ApiResponse } from '@/types/shared';

import { $fetch } from '@/lib/fetch';

export async function getNotes() {
  try {
    const result = await $fetch<ApiResponse<Note[]>>('/api/v1/notes');

    if (!result.success) return [];

    return result.data;
  } catch {
    return [];
  }
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
