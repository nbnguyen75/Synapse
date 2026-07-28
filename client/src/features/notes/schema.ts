import { z } from 'zod/v4';

export const notesQueryParamsSchema = z.object({
  pageSize: z.number().optional(),
  sort: z.string().optional(),
  page: z.number().optional(),
  q: z.string().optional(),
});

export type NotesQueryParams = z.infer<typeof notesQueryParamsSchema>;
