import z from 'zod/v4';

export const conversationIdParamSchema = z.object({
	id: z.uuid()
});
