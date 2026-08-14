import type { MessageMetadata } from '@/database/schema';

import {
	convertToModelMessages,
	createIdGenerator,
	createUIMessageStreamResponse,
	isStepCount,
	safeValidateUIMessages,
	smoothStream,
	streamText,
	toUIMessageStream,
	type UIMessage
} from 'ai';

import { buildSystemInstruction, MAX_OUTPUT_TOKENS, type UserAiSettings } from '@/settings';
import {
	createSearchChatHistoriesTool,
	createSearchNotesTool,
	createSearchWebTool
} from '@/chat/tools';
import { appendMessage, getOrCreateConversation, loadActivePath } from '@/conversation';
import { CHAT_TEMPERATURE, RECENT_HISTORY_LIMIT } from '@/chat/constants';
import { dataPartSchema, messageMetadataSchema } from '@/chat/schemas';
import { chatModel } from '@/lib/ai';

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
		metadataSchema: messageMetadataSchema,
		messages: [message]
	});
}

export function extractQuestionText(message: UIMessage): string {
	return message.parts
		.filter((p) => p.type === 'text')
		.map((p) => p.text)
		.join(' ');
}

function getResponseLengthInstruction(length: 'balanced' | 'detailed' | 'short'): string {
	switch (length) {
		case 'short':
			return `- **Độ dài**: Ngắn gọn (tối đa 2-3 câu). Trả lời trực tiếp vào trọng tâm.`;
		case 'balanced':
			return `- **Độ dài**: Vừa phải (dưới 250 từ). Trình bày tự nhiên, chỉ dùng danh sách hoặc ví dụ khi thực sự cần thiết.`;
		case 'detailed':
			return `- **Độ dài**: Chi tiết (khoảng 400-500 từ). Phân tích sâu, linh hoạt dùng định dạng và ví dụ để làm rõ ý.`;
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
		hour12: false
	});

	const timeZoneStr = userMessageMetadata?.timeZone ? ` (${userMessageMetadata.timeZone})` : '';

	return `Bạn là "${settings.botName}", trợ lý Synapse.
${buildSystemInstruction(settings)}

[ĐỘ DÀI]
${lengthInstruction}

[TOOL MATCHING - THEO ƯU TIÊN]
0. KHÔNG TOOL: Hỏi đáp chung, code, toán, logic, chào hỏi -> Trả lời ngay.
1. searchNotes (Dữ liệu cá nhân): Lịch hẹn, mật khẩu, ghi chú. (Hỏi chung/mới nhất -> query: ""; Cụ thể -> query: 1-2 từ khóa).
2. searchChatHistory (Nội bộ phiên chat): Hỏi lại nội dung đã nói trong cuộc trò chuyện này.
3. searchWeb (Thời gian thực): Thời tiết, tỷ giá, giá vàng, tin tức thời sự.

[XỬ LÝ DỮ LIỆU NOTES]
- Mặc định: Chỉ trích xuất & tóm tắt đúng đáp án. Không in nguyên văn/lộ thông tin không liên quan.
- Chỉ in nguyên văn khi user yêu cầu trực tiếp ("đọc hết", "in toàn bộ").

[PHẢN HỒI]
Trả lời thẳng vấn đề, thân thiện. Lịch hiện tại: ${currentDate}${timeZoneStr}.`;
}

export async function prepareChatTurn(
	userId: string,
	conversationId: undefined | string,
	userMessage: UIMessage,
	parentMessageId?: string
) {
	const conversation = await getOrCreateConversation(userId, conversationId);
	const context = parentMessageId ? await loadActivePath(conversation.id, parentMessageId) : [];

	await appendMessage(conversation.id, userMessage, parentMessageId);

	return { history: context, conversation };
}

export async function saveAssistantReply(
	conversationId: string,
	message: UIMessage,
	metadata?: Record<string, unknown>,
	parentMessageId?: string
) {
	const messageWithMetadata: UIMessage = {
		...message,
		metadata: {
			...(message.metadata as MessageMetadata),
			...metadata,
			createdAt: Date.now()
		}
	};

	await appendMessage(conversationId, messageWithMetadata, parentMessageId);
}

interface CreateChatStreamOptions {
	contextMessages: UIMessage[];
	lastUserMessage: UIMessage;
	settings: UserAiSettings;
	conversationId: string;
	userId: string;
}

export async function createChatStreamResponse(options: CreateChatStreamOptions) {
	const { contextMessages, lastUserMessage, conversationId, settings } = options;

	const systemPrompt = buildSystemPrompt(settings, lastUserMessage.metadata as MessageMetadata);

	const recentHistory = contextMessages.slice(RECENT_HISTORY_LIMIT);
	const rawMessages = [...recentHistory, lastUserMessage].filter((m) => m.role !== 'system');

	const cleanMessages = sanitizeMessages(rawMessages);

	const segmenterLocale = settings.language === 'en' ? 'en' : 'vi';
	const segmenter = new Intl.Segmenter(segmenterLocale, { granularity: 'word' });

	const result = streamText({
		experimental_transform: smoothStream({
			chunking: segmenter,
			delayInMs: 5
		}),
		onError: ({ error }) => {
			console.error('[Chat streamText error]:', error);
		},
		maxOutputTokens: MAX_OUTPUT_TOKENS[settings.responseLength],
		messages: await convertToModelMessages(cleanMessages),
		tools: getChatTools(options.userId, conversationId),
		temperature: CHAT_TEMPERATURE,
		instructions: systemPrompt,
		stopWhen: isStepCount(5),
		model: chatModel
	});

	const uiStream = toUIMessageStream({
		onEnd: async ({ messages }) => {
			try {
				const assistantMsg = messages.at(-1);
				if (assistantMsg?.role === 'assistant') {
					const usage = await result.usage;

					await saveAssistantReply(
						conversationId,
						assistantMsg,
						{
							tokens: {
								outputTokens: usage.outputTokens,
								inputTokens: usage.inputTokens,
								totalTokens: usage.totalTokens
							},
							responseLength: settings.responseLength,
							model: chatModel.modelId
						},
						lastUserMessage.id
					);
				}
			} catch (error) {
				console.error('[Save Assistant Reply Failed]:', error);
			}
		},
		generateMessageId: createIdGenerator({ prefix: 'msg', size: 16 }),
		originalMessages: [...contextMessages, lastUserMessage],
		stream: result.stream
	});

	const response = createUIMessageStreamResponse({ stream: uiStream });
	response.headers.set('X-Conversation-Id', conversationId);

	response.headers.set('X-Accel-Buffering', 'no');
	response.headers.set('Cache-Control', 'no-cache, no-transform');
	response.headers.set('Content-Type', 'text/x-unknown');

	return response;
}

interface SanitizeOptions {
	stripOldAttachments?: boolean;
	maxHistory?: number;
}

export function sanitizeMessages(messages: UIMessage[], options: SanitizeOptions = {}) {
	const { stripOldAttachments = true, maxHistory = 15 } = options;

	if (messages.length === 0) return [];

	// 1. Sliding Window: Chỉ lấy N tin nhắn gần nhất
	const recentMessages = messages.slice(-maxHistory);
	const sanitized: UIMessage[] = [];
	const lastIndex = recentMessages.length - 1;

	for (let i = 0; i < recentMessages.length; i++) {
		const msg = recentMessages[i];
		if (!Array.isArray(msg.parts) || msg.parts.length === 0) continue;

		const isLatestMessage = i === lastIndex;

		const cleanedParts = msg.parts.filter((part) => {
			if (part.type === 'text') {
				return typeof part.text === 'string' && part.text.trim().length > 0;
			}

			if (!isLatestMessage && stripOldAttachments && part.type === 'file') {
				return false;
			}

			if (part.type === 'tool-invocation' && part.state !== 'output-available') {
				console.warn(`[sanitizeMessages] Stripping incomplete tool call: ${part.toolCallId}`);
				return false;
			}

			return true;
		});

		if (cleanedParts.length === 0) continue;

		sanitized.push({
			parts: cleanedParts as UIMessage['parts'],
			role: msg.role,
			id: msg.id
		});
	}

	return sanitized;
}
