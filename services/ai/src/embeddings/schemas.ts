import z from 'zod/v4';

export const noteUpsertedEventSchema = z.object({
	title: z.string().nullable().optional(),
	trashed: z.boolean().default(false),
	content: z.string(),
	noteId: z.string(),
	userId: z.string()
});

export const noteDeletedEventSchema = z.object({
	noteId: z.uuid()
});
