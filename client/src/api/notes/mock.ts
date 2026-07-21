import type { Note } from '@/types';

import { INITIAL_NOTES } from '@/mock-data/notes';

const LOCAL_STORAGE_KEY = 'synapse_notes';
const API_LATENCY_MS = 400;

function delay(ms: number): Promise<void> {
   return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadNotes(): Note[] {
   const str = localStorage.getItem(LOCAL_STORAGE_KEY);
   if (!str) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_NOTES));
      return INITIAL_NOTES;
   }
   try {
      return JSON.parse(str) as Note[];
   } catch {
      return INITIAL_NOTES;
   }
}

function saveNotes(notes: Note[]): void {
   localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
}

export async function getNotes(): Promise<Note[]> {
   await delay(API_LATENCY_MS);
   return loadNotes();
}

export async function createNote(
   title: string,
   content: string,
   userId: string,
   tags?: string[],
   pinned?: boolean,
): Promise<Note> {
   await delay(API_LATENCY_MS);
   if (!title.trim()) throw new Error('Title is required');

   const notes = loadNotes();
   const newNote: Note = {
      id: `note_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: pinned || false,
      content: content || '',
      title: title.trim(),
      tags: tags || [],
      userId,
   };
   notes.unshift(newNote);
   saveNotes(notes);
   return newNote;
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
   await delay(API_LATENCY_MS);
   if (updates.title !== undefined && !updates.title.trim())
      throw new Error('Title is required');

   const notes = loadNotes();
   const index = notes.findIndex((n) => n.id === id);
   if (index === -1) throw new Error('Note not found');

   const existing = notes[index];
   const hasTitleChanged =
      updates.title !== undefined && updates.title.trim() !== existing.title;
   const hasContentChanged =
      updates.content !== undefined && updates.content !== existing.content;

   let updatedVersions = existing.versions || [];
   if (hasTitleChanged || hasContentChanged) {
      updatedVersions = [
         {
            id: `ver_${Math.random().toString(36).substring(2, 9)}`,
            updatedAt: existing.updatedAt,
            content: existing.content,
            title: existing.title,
         },
         ...updatedVersions,
      ].slice(0, 10);
   }

   const updated: Note = {
      ...existing,
      archived:
         updates.archived !== undefined ? updates.archived : existing.archived,
      content:
         updates.content !== undefined ? updates.content : existing.content,
      title:
         updates.title !== undefined ? updates.title.trim() : existing.title,
      pinned: updates.pinned !== undefined ? updates.pinned : existing.pinned,
      tags: updates.tags !== undefined ? updates.tags : existing.tags,
      updatedAt: new Date().toISOString(),
      versions: updatedVersions,
   };
   notes[index] = updated;
   saveNotes(notes);
   return updated;
}

export async function deleteNote(id: string): Promise<string> {
   await delay(API_LATENCY_MS);
   const notes = loadNotes();
   saveNotes(notes.filter((n) => n.id !== id));
   return id;
}
