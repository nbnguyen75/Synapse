import z from 'zod/v4';

export const settingsSchema = z
	.object({
		preset: z
			.enum(['concise', 'friendly', 'professional', 'socratic', 'custom'])
			.default('friendly'),
		responseLength: z.enum(['short', 'balanced', 'detailed']).default('balanced'),
		botName: z.string().trim().min(1).max(40).default('Synapse'),
		language: z.enum(['vi', 'en', 'auto']).default('auto'),
		customInstructions: z.string().max(1000).optional(),
		useEmoji: z.boolean().default(false)
	})
	.refine((data) => data.preset !== 'custom' || !!data.customInstructions?.trim(), {
		message: "customInstructions is required when preset is 'custom'",
		path: ['customInstructions']
	});

export type UserAiSettings = z.infer<typeof settingsSchema>;
