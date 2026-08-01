import z from 'zod/v4';

export const messageMetadataSchema = z.object({
	createdAt: z.number().optional(),
	model: z.string().optional()
});

export const dataPartSchema = z.object({
	sourceNotes: z.object({ title: z.string(), id: z.string() })
});

const looseUIMessageSchema = z.object({
	parts: z.array(z.record(z.string(), z.unknown())).min(1),
	role: z.enum(['user', 'assistant']),
	id: z.string().optional()
});

export const chatRequestSchema = z.object({
	conversationId: z.uuid().optional(),
	message: looseUIMessageSchema
});
