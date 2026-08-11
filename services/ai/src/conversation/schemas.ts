import z from 'zod/v4';

export const conversationIdParamSchema = z.object({
	id: z.uuid()
});

export const messagesQuerySchema = z.object({
	limit: z.coerce.number().int().positive().max(100).default(15),
	offset: z.coerce.number().int().nonnegative().default(0)
});

export const renameConversationSchema = z.object({
	title: z.string().trim().min(1).max(100)
});

export const favoriteConversationSchema = z.object({
	favorited: z.boolean()
});
