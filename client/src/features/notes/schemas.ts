import { z } from 'zod/v4';

import {
  NOTE_BULK_ACTIONS,
  NOTE_SORTABLE_FIELDS,
} from '@/features/notes/constants';

import { m } from '@/paraglide/messages';

import { paginationQuerySchema } from '@/schemas';

export const notesQueryParamsSchema = paginationQuerySchema.extend({
  sort: z
    .enum(NOTE_SORTABLE_FIELDS, { message: m.validation_sort_invalid() })
    .nullable()
    .default(null),
  q: z.string().optional(),
});

export type NotesQueryParams = z.infer<typeof notesQueryParamsSchema>;

export const noteIdParamSchema = z.object({
  id: z.string().trim().min(1, { message: m.validation_id_required() }),
});

export type NoteIdParams = z.infer<typeof noteIdParamSchema>;

export const noteInputSchema = z.object({
  content: z
    .string()
    .min(1, { message: m.notes_page_toast_title_required() })
    .max(1500, { message: m.validation_content_max() }),
  title: z
    .string()
    .trim()
    .max(200, { message: m.validation_title_max() })
    .optional(),
});

export type NoteFormInput = z.input<typeof noteInputSchema>;

export type NoteInputPayload = z.infer<typeof noteInputSchema>;

export const bulkNoteActionsSchema = z.object({
  ids: z
    .array(z.string().min(1, { message: m.validation_id_required() }))
    .min(1, { message: m.validation_ids_required() }),
  action: z.enum(NOTE_BULK_ACTIONS),
});

export type BulkNoteActions = z.infer<typeof bulkNoteActionsSchema>;

export const generateNoteTitleSchema = z.object({
  content: z.string().min(1, { message: m.validation_content_required() }),
});

export type GenerateNoteTitleInput = z.infer<typeof generateNoteTitleSchema>;
