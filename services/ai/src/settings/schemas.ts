import z from 'zod/v4';

export const settingsSchema = z.object({
	preset: z
		.enum(['concise', 'friendly', 'professional', 'socratic', 'custom'])
		.default('friendly'),
	responseLength: z.enum(['short', 'balanced', 'detailed']).default('balanced'),
	language: z.enum(['vi', 'en', 'auto']).default('auto'),
	customInstructions: z.string().max(1000).optional(),
	useEmoji: z.boolean().default(false)
});

export type UserAiSettings = z.infer<typeof settingsSchema>;
