import z from 'zod/v4';

import { MAX_EMBEDDING_INPUT_LENGTH } from '@/embeddings';

export const generateTitleRequestSchema = z.object({
	content: z
		.string()
		.min(1, 'Nội dung không được để trống')
		.max(
			MAX_EMBEDDING_INPUT_LENGTH,
			`Nội dung không được vượt quá ${MAX_EMBEDDING_INPUT_LENGTH} ký tự`
		)
});

export const outputNoteTitleSchema = z.object({
	title: z.string().trim()
});
