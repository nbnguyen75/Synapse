import type { MessageMetadata } from '@/database/schema';

import { safeValidateUIMessages, type UIMessage } from 'ai';

import {
	createSearchChatHistoriesTool,
	createSearchNotesTool,
	createSearchWebTool
} from '@/chat/tools';
import { appendMessage, getOrCreateConversation, loadHistory } from '@/conversation';
import { buildSystemInstruction, type UserAiSettings } from '@/settings';
import { RAG_SIMILARITY_THRESHOLD, RAG_TOP_K } from '@/chat/constants';
import { findTopKSimilarNotes } from '@/chat/repository';
import { dataPartSchema } from '@/chat/schemas';
import { embedText } from '@/lib/ai';

export function getChatTools(userId: string, conversationId: string) {
	return {
		searchChatHistories: createSearchChatHistoriesTool(conversationId),
		searchNotes: createSearchNotesTool(userId),
		searchWeb: createSearchWebTool()
	};
}

export async function validateChatMessages(message: unknown) {
	return safeValidateUIMessages({
		dataSchemas: { note_sources: dataPartSchema },
		messages: [message]
	});
}

export function extractQuestionText(message: UIMessage): string {
	return message.parts
		.filter((p) => p.type === 'text')
		.map((p) => p.text)
		.join(' ');
}

/**
 * @deprecated
 * @param userId
 * @param question
 * @returns
 */
export async function retrieveRelevantNotes(userId: string, question: string) {
	const queryEmbedding = await embedText(question);
	const results = await findTopKSimilarNotes(userId, queryEmbedding, RAG_TOP_K);
	return results.filter((r) => r.similarity > RAG_SIMILARITY_THRESHOLD);
}

function getResponseLengthInstruction(length: 'balanced' | 'detailed' | 'short'): string {
	switch (length) {
		case 'short':
			return `- **Độ dài**: Trả lời CỰC KỲ NGẮN GỌN (tối đa 2-3 câu, khoảng 100 từ). Đi thẳng vào kết quả.`;
		case 'balanced':
			return `- **Độ dài**: Trả lời CÔ ĐỌNG, VỪA PHẢI (tối đa khoảng 250 - 300 từ). 
- **Cách trình bày**: Dùng các dấu gạch đầu dòng ngắn gọn. Hãy tóm tắt các ý chính và TỰ KẾT THÚC CÂU HOÀN CHỈNH, tuyệt đối không viết bài quá dài dẫn đến bị ngắt câu.`;
		case 'detailed':
			return `- **Độ dài**: Trả lời CHI TIẾT và ĐẦY ĐỦ (khoảng 500 - 600 từ). Phân tích sâu các khía cạnh.`;
	}
}

export function buildSystemPrompt(
	settings: UserAiSettings,
	userMessageMetadata?: MessageMetadata
): string {
	const lengthInstruction = getResponseLengthInstruction(settings.responseLength);

	const dateObj = userMessageMetadata?.createdAt
		? new Date(userMessageMetadata.createdAt)
		: new Date();

	const currentDate = dateObj.toLocaleString('sv-SE', {
		timeZone: userMessageMetadata?.timeZone,
		minute: '2-digit',
		month: '2-digit',
		hour: '2-digit',
		year: 'numeric',
		day: '2-digit',
		hour12: false // Dùng định dạng 24h
	});

	const timeZoneInfo = userMessageMetadata?.timeZone ? ` (${userMessageMetadata.timeZone})` : '';

	return `Bạn là "${settings.botName}", trợ lý ghi chú cá nhân được xây dựng trên nền tảng Synapse.
  - Thời gian hiện tại: ${currentDate}${timeZoneInfo}

${buildSystemInstruction(settings)}

--- QUY TẮC ĐỘ DÀI ---
${lengthInstruction}

==================================================
QUY TẮC SỬ DỤNG TOOL "searchNotes" & DỊCH Ý ĐỊNH
==================================================

Khi người dùng đưa ra một câu hỏi, bạn PHẢI phân tích ý định (Intent) trước khi gọi Tool "searchNotes":

1. CÂU HỎI TỔNG QUÁT / THỜI GIAN MƠ HỒ:
   - Ví dụ: "Sắp tới có sự kiện gì?", "Tuần này mình có lịch gì không?", "Dạo này có kế hoạch gì?", "Xem ghi chú gần đây".
   - Hành động: TRUYỀN CHUỖI RỖNG query: "" vào tool searchNotes. 
   - Lý do: Đừng cố đoán từ khóa (như "sự kiện", "kế hoạch"). Chuỗi rỗng sẽ kích hoạt hệ thống lấy các ghi chú mới nhất/gần đây nhất, sau đó bạn sẽ tự đọc nội dung ghi chú để trả lời người dùng.

2. CÂU HỎI THEO CHỦ ĐỀ / TỪ ĐỒNG NGHĨA:
   - Ví dụ: "Tìm ghi chú về tiệc tùng", "Nhắc mình lịch đi chơi", "Thông tin xe cộ".
   - Hành động: Rút gọn query thành 1-2 từ cốt lõi nhất. 
   - Ví dụ: "Tìm ghi chú về tiệc tùng" -> query: "tiệc" hoặc "đám cưới".

3. CÂU HỎI TRA CỨU CHÍNH XÁC (Specific Search):
   - Ví dụ: "Mật khẩu wifi nhà là gì?", "Số tài khoản Techcombank", "Mã cửa 1234".
   - Hành động: Giữ nguyên từ khóa quan trọng chính xác -> query: "wifi", "Techcombank", "mã cửa".

4. PHÂN BIỆT TOOL:
   - "searchNotes": Dùng khi tìm thông tin TRONG GHI CHÚ/TÀI LIỆU cá nhân.
   - "searchChatHistory": CHỈ dùng khi người dùng hỏi lại lịch sử trò chuyện (Ví dụ: "Hồi nãy mình vừa hỏi câu gì?", "Lúc nãy bạn nói gì về IT?").
   - "searchWeb": CHỈ DÙNG khi người dùng hỏi không tìm được câu trả lời hay câu trả lời trong trí nhớ quá cũ hay cần thêm thông tin để trả lời vấn đề không nằm ở các tool trên.

==================================================
QUY TẮC TRẢ LỜI
==================================================
- Dựa trên kết quả trả về từ Tool, hãy trả lời ngắn gọn, thân thiện và đi thẳng vào vấn đề.
- Nếu ghi chú chứa mốc thời gian, hãy đối chiếu với "Thời gian hiện tại" ở trên để nhắc nhở người dùng hợp lý.`;
}

export async function prepareChatTurn(
	userId: string,
	conversationId: undefined | string,
	userMessage: UIMessage
) {
	const conversationResult = await getOrCreateConversation(userId, conversationId);
	if (!conversationResult.success) return conversationResult;

	const history = await loadHistory(conversationResult.data.id);
	await appendMessage(conversationResult.data.id, userMessage);

	return { data: { conversation: conversationResult.data, history }, success: true as const };
}

export async function saveAssistantReply(
	conversationId: string,
	message: UIMessage,
	metadata?: Record<string, unknown>
) {
	const messageWithMetadata: UIMessage = {
		...message,
		metadata: {
			...(message.metadata as MessageMetadata),
			...metadata,
			createdAt: Date.now()
		}
	};

	await appendMessage(conversationId, messageWithMetadata);
}

export function sanitizeMessages(messages: UIMessage[]): UIMessage[] {
	const sanitized: UIMessage[] = [];

	for (const msg of messages) {
		if (msg.role === 'assistant' && Array.isArray(msg.parts)) {
			// 💡 Lọc các parts trong assistant message
			const validParts = msg.parts.filter((part) => {
				const isToolPart = part.type.startsWith('tool-') || part.type === 'tool-invocation';

				if (isToolPart) {
					// Lấy state trực tiếp từ part (SDK mới) hoặc từ part.toolInvocation (SDK cũ)
					const state =
						'state' in part
							? (part as { state?: string }).state
							: (part as { toolInvocation?: { state?: string } }).toolInvocation?.state;

					return state === 'result';
				}
				return true; // Giữ lại text, reasoning, sources...
			});

			const hasValidContent = validParts.some((part) => {
				if (part.type === 'text') return part.text.trim().length > 0;
				if (part.type.startsWith('tool-') || part.type === 'tool-invocation') return true;
				return false;
			});

			if (hasValidContent) {
				sanitized.push({
					...msg,
					parts: validParts
				});
			}
		} else {
			sanitized.push(msg);
		}
	}

	// Đảm bảo tin nhắn cuối không phải assistant chứa tool chưa có kết quả
	while (sanitized.length > 0) {
		const lastMsg = sanitized[sanitized.length - 1];
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (lastMsg.role === 'assistant' && lastMsg.parts) {
			const hasUnfinishedTool = lastMsg.parts.some((p) => {
				const isTool = p.type.startsWith('tool-') || p.type === 'tool-invocation';
				if (!isTool) return false;

				const state =
					'state' in p
						? (p as { state?: string }).state
						: (p as { toolInvocation?: { state?: string } }).toolInvocation?.state;

				return state !== 'result';
			});

			if (hasUnfinishedTool) {
				sanitized.pop();
				continue;
			}
		}
		break;
	}

	return sanitized;
}
