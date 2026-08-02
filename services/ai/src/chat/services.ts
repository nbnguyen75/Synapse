import { safeValidateUIMessages, type UIMessage } from 'ai';

import { appendMessage, getOrCreateConversation, loadHistory } from '@/conversation';
import { buildSystemInstruction, type UserAiSettings } from '@/settings';
import { RAG_SIMILARITY_THRESHOLD, RAG_TOP_K } from '@/chat/constants';
import { findTopKSimilarNotes } from '@/chat/repository';
import { dataPartSchema } from '@/chat/schemas';
import { embedText } from '@/lib/ai';

export async function validateChatMessages(message: unknown) {
	return safeValidateUIMessages({
		dataSchemas: { note_sources: dataPartSchema },
		// metadataSchema: messageMetadataSchema, // TODO: will add meta later
		messages: [message]
	});
}

export function extractQuestionText(message: UIMessage): string {
	return message.parts
		.filter((p) => p.type === 'text')
		.map((p) => p.text)
		.join(' ');
}

export async function retrieveRelevantNotes(userId: string, question: string) {
	const queryEmbedding = await embedText(question);
	const results = await findTopKSimilarNotes(userId, queryEmbedding, RAG_TOP_K);
	return results.filter((r) => r.similarity > RAG_SIMILARITY_THRESHOLD);
}

export async function buildSystemPrompt(
	settings: UserAiSettings,
	contextNotes: { title: string | null; content: string }[]
) {
	const context = contextNotes
		.map((n, i) => `[Note ${i + 1}: ${n.title ?? 'Untitled'}]\n${n.content}`)
		.join('\n\n');

	return `Bạn là "${settings.botName}", trợ lý ghi chú cá nhân được xây dựng trên nền tảng Synapse. Trả lời dựa trên các note dưới đây. Nếu không đủ thông tin, nói rõ không tìm thấy trong ghi chú, không bịa.

${buildSystemInstruction(settings)}

--- NOTES ---
${context || '(Không có note liên quan)'}`;
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

export async function saveAssistantReply(conversationId: string, message: UIMessage) {
	await appendMessage(conversationId, message);
}
