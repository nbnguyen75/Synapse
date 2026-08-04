import { tavily } from '@tavily/core';
import { tool } from 'ai';
import z from 'zod/v4';

import { searchOlderMessages } from '@/chat/repository';
import { env } from '@/env';

function extractTextFromParts(parts: unknown): string {
	if (!Array.isArray(parts)) return '';
	return parts
		.filter((p) => p && typeof p === 'object' && p.type === 'text' && typeof p.text === 'string')
		.map((p) => p.text as string)
		.join(' ');
}

export function createSearchChatHistoriesTool(conversationId: string) {
	return tool({
		execute: async ({ query }) => {
			if (!conversationId) {
				return {
					message: 'Không tìm thấy ID cuộc trò chuyện.',
					status: 'not_found'
				};
			}

			const olderMessages = await searchOlderMessages(conversationId, query, 5);

			console.warn('[search-chat-histories-tool.query]: ', query);
			console.warn('[search-chat-histories-tool.older-messages]: ', olderMessages);

			if (!olderMessages.length) {
				return {
					message: 'Không tìm thấy tin nhắn cũ nào khớp với từ khóa tìm kiếm.',
					status: 'not_found'
				};
			}

			return {
				messages: olderMessages.map((m) => ({
					content: extractTextFromParts(m.parts),
					role: m.role
				})),
				count: olderMessages.length,
				status: 'success'
			};
		},
		description:
			'Tìm kiếm lại các tin nhắn hoặc thông tin cũ trong cuộc trò chuyện hiện tại khi người dùng nhắc tới nội dung đã trao đổi trước đó.',
		inputSchema: z.object({
			query: z
				.string()
				.describe('Từ khóa hoặc ý chính ngắn gọn cần tìm lại trong lịch sử trò chuyện')
		})
	});
}

const tvly = tavily({ apiKey: env.TAVILY_API_KEY });

export function createSearchWebTool() {
	return tool({
		execute: async ({ query }) => {
			try {
				const response = await tvly.search(query, {
					searchDepth: 'basic',
					maxResults: 5
				});

				console.warn('[search-web-tool.query]: ', query);

				if (response.results.length === 0) {
					return { message: 'Không tìm thấy kết quả nào trên Internet.', results: [] };
				}

				return {
					results: response.results.map((item) => ({
						content: item.content,
						title: item.title,
						url: item.url
					}))
				};
			} catch (error) {
				console.error('[Tavily Search Error]:', error);
        
				return { error: 'Không thể kết nối tới dịch vụ tìm kiếm web.' };
			}
		},
		description:
			'Tìm kiếm thông tin thời gian thực trên Internet khi người dùng hỏi về tin tức, thời tiết, kiến thức chung hoặc thông tin không có trong ghi chú cá nhân.',
		inputSchema: z.object({
			query: z.string().describe('Từ khóa tìm kiếm bằng tiếng Việt hoặc tiếng Anh')
		})
	});
}
