import { generateText, Output } from 'ai';

import {
	MAX_OUTPUT_TOKENS_GENERATE_TITLE,
	TEMPERATURE_GENERATE_TITLE
} from '@/generator/constants';
import { outputNoteTitleSchema } from '@/generator/schemas';
import { generateTitleModel } from '@/lib/ai';

export async function generateNoteTitle(content: string) {
	const controller = new AbortController();

	const timeoutPromise = new Promise<string>((resolve) => {
		setTimeout(() => {
			controller.abort();
			resolve('Untitled');
		}, 5_000);
	});

	const aiPromise = (async () => {
		try {
			const { output } = await generateText({
				instructions:
					'Bạn tạo tiêu đề ngắn gọn cho ghi chú. Chỉ trả về đúng tiêu đề, không giải thích, không dấu ngoặc kép, đúng trọng tâm và theo ngôn ngữ viết của content.',
				output: Output.object({
					schema: outputNoteTitleSchema
				}),
				maxOutputTokens: MAX_OUTPUT_TOKENS_GENERATE_TITLE,
				temperature: TEMPERATURE_GENERATE_TITLE,
				model: generateTitleModel,
				prompt: content
			});

			return output.title;
		} catch (error) {
			console.error('[GenerateNoteTitle Error]:', error);

			return 'Untitled';
		}
	})();

	return Promise.race([aiPromise, timeoutPromise]);
}
