import z from 'zod/v4';

export const conversationIdParamSchema = z.object({
	id: z.uuid()
});

export const renameConversationSchema = z.object({
	title: z.string().trim().min(1).max(100)
});

export const favoriteConversationSchema = z.object({
	favorited: z.boolean()
});
