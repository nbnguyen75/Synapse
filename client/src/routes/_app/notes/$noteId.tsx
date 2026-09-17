import type { Note } from '@/features/notes/types';

import { createFileRoute, redirect } from '@tanstack/react-router';

import { z } from 'zod/v4';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';

import { NoteDetailPage } from '@/features/notes/components/note-detail-page';
import { NoteDetailSkeleton } from '@/features/notes/components';
import { getNoteClient } from '@/features/notes/api/notes.http';

export const Route = createFileRoute('/_app/notes/$noteId')({
  validateSearch: z.object({
    from: z.enum(['favorites', 'archive', 'trash']).optional(),
  }),
  loader: async ({ params }): Promise<Note> => {
    const { noteId } = params;
    try {
      return await getNoteClient({ params: { id: noteId } });
    } catch {
      console.error(`Note not found with id: ${noteId}`);

      throw redirect({ to: '/notes' });
    }
  },
  staticData: {
    breadcrumb: ({ loaderData, params }) => {
      const title =
        loaderData !== null &&
        typeof loaderData === 'object' &&
        'title' in loaderData &&
        typeof loaderData.title === 'string'
          ? loaderData.title
          : undefined;

      return title || params.noteId || '';
    },
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: createTitle(loaderData?.title ? loaderData.title : m.notes_page_detail_title()),
      },
    ],
  }),
  component: NoteDetailPage,
  pendingComponent: () => <NoteDetailSkeleton />,
  pendingMs: 150,
  pendingMinMs: 300,
});
