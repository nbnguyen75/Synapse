import { z } from 'zod/v4';

import { SORTABLE_FIELDS } from '@/features/notes/constants';

import { m } from '@/paraglide/messages';

export const notesQueryParamsSchema = z.object({
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  page: z.coerce.number().int().positive().optional(),
  sort: z.enum(SORTABLE_FIELDS).optional(),
  q: z.string().optional(),
});

export type NotesQueryParams = z.infer<typeof notesQueryParamsSchema>;

export interface NotesApiParams extends Omit<NotesQueryParams, 'sort'> {
  archived?: boolean;
  favorite?: boolean;
  trashed?: boolean;
  sort?: string[];
}

export const noteFormSchema = z.object({
  title: z.string().min(1, { message: m.notes_page_toast_title_required() }),
  content: z.string().optional(),
});

export type NoteFormValues = z.infer<typeof noteFormSchema>;

export const noteCreateFormSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1).max(1500),
});

export type NoteCreateFormValues = z.infer<typeof noteCreateFormSchema>;

export type NoteViewMode = 'active' | 'favorites' | 'archive' | 'trash';
