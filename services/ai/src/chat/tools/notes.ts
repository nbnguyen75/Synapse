import { tool } from 'ai';
import z from 'zod/v4';

import { searchNotesHybrid } from '@/chat/repository';

export function createSearchNotesTool(userId: string) {
	return tool({
		execute: async ({ query }) => {
			const notes = await searchNotesHybrid({
				limit: 5,
				userId,
				query
			});

			console.warn('[search-notes-tool.query]: ', query);
			console.warn('[search-notes-tool.data]: ', notes);

			if (!notes.length) {
				return {
					message: 'Không tìm thấy ghi chú nào phù hợp.',
					status: 'not_found'
				};
			}

			return {
				notes: notes.map((n) => ({
					content: n.content,
					title: n.title,
					id: n.id
				})),
				count: notes.length,
				status: 'success'
			};
		},
		inputSchema: z.object({
			query: z
				.string()
				.describe('Từ khóa hoặc ý tưởng cần tìm kiếm (có thể để rỗng nếu hỏi chung chung)')
		}),
		description: 'Tìm kiếm thông tin trong các ghi chú cá nhân của người dùng.'
	});
}
