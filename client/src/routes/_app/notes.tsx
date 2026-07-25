import { createFileRoute } from '@tanstack/react-router';

import NotesPage from '@/features/notes/components/notes-page';
import { notesSearchSchema } from '@/features/notes/constants';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';

export const Route = createFileRoute('/_app/notes')({
   head: () => ({
      meta: [{ title: createTitle(m.notes_page_title()) }],
   }),
   validateSearch: notesSearchSchema,
   component: NotesPage,
});
