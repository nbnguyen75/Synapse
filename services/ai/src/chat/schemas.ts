import z from 'zod/v4';

export const messageMetadataSchema = z.object({
	tokens: z
		.object({
			completionTokens: z.number().optional(),
			promptTokens: z.number().optional(),
			totalTokens: z.number().optional()
		})
		.optional(),
	responseLength: z.string().optional(),
	createdAt: z.number().optional(),
	model: z.string().optional()
});

export const dataPartSchema = z.object({
	sourceNotes: z.object({ title: z.string(), id: z.string() })
});

const looseUIMessageSchema = z.object({
	metadata: z.looseObject(messageMetadataSchema.shape).optional(),
	parts: z.array(z.record(z.string(), z.unknown())).min(1),
	role: z.enum(['user', 'assistant']),
	id: z.string().optional()
});

export const chatRequestSchema = z.object({
	parentMessageId: z.string().optional(),
	conversationId: z.uuid().optional(),
	message: looseUIMessageSchema
});

export const regenerateRequestSchema = z.object({
	assistantMessageId: z.string(),
	conversationId: z.uuid()
});
