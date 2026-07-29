import { z } from 'zod/v4';

import { SORTABLE_FIELDS } from '@/features/notes/constants';

export const notesQueryParamsSchema = z.object({
  pageSize: z.number().int().positive().max(100).optional(),
  page: z.number().int().positive().optional(),
  sort: z.enum(SORTABLE_FIELDS).optional(),
  q: z.string().optional(),
  // TODO: add order later
});

export type NotesQueryParams = z.infer<typeof notesQueryParamsSchema>;

export const noteFormSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  content: z.string().optional(),
});

export type NoteFormValues = z.infer<typeof noteFormSchema>;
