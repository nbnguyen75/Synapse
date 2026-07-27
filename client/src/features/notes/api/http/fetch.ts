import type { Note } from '@/features/notes/types';

import { $fetch } from '@/lib/fetch-client';

export async function getNotes(): Promise<Note[]> {
   const res = await $fetch.get('/api/notes');
   return (res.data || res) as Note[];
}

export async function getNote(id: string): Promise<Note> {
   const res = await $fetch.get(`/api/notes/${id}`);
   return (res.data || res) as Note;
}

export async function createNote(
   title: string,
   content: string,
   userId: string,
   tags?: string[],
   pinned?: boolean,
): Promise<Note> {
   const res = await $fetch.post('/api/notes', {
      body: { content, userId, pinned, title, tags },
   });
   return (res.data || res) as Note;
}

export async function updateNote(
   id: string,
   updates: {
      archived?: boolean;
      content?: string;
      pinned?: boolean;
      tags?: string[];
      title?: string;
   },
): Promise<Note> {
   const res = await $fetch.put(`/api/notes/${id}`, { body: updates });
   return (res.data || res) as Note;
}

export async function deleteNote(id: string): Promise<string> {
   await $fetch.delete(`/api/notes/${id}`);
   return id;
}
