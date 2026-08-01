import { safeValidateUIMessages, type UIMessage } from 'ai';

import { appendMessage, getOrCreateConversation, loadHistory } from '@/conversation';
import { MAX_NOTE_CONTENT_LENGTH, RAG_SIMILARITY_THRESHOLD, RAG_TOP_K } from '@/chat/constants';
import { dataPartSchema, messageMetadataSchema } from '@/chat/schemas';
import { buildSystemInstruction, getUserSettings, type UserAiSettings } from '@/settings';
import { findTopKSimilarNotes } from '@/chat/repository';
import { embedText } from '@/lib/ai';

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

export async function retrieveRelevantNotes(userId: string, question: string) {
	const queryEmbedding = await embedText(question);
	const results = await findTopKSimilarNotes(userId, queryEmbedding, RAG_TOP_K);
	return results.filter((r) => r.similarity > RAG_SIMILARITY_THRESHOLD);
}

export async function buildSystemPrompt(
	settings: UserAiSettings,
	contextNotes: { title: string; content: string }[]
) {
	const context = contextNotes
		.map((n, i) => `[Note ${i + 1}: ${n.title}]\n${n.content.slice(0, MAX_NOTE_CONTENT_LENGTH)}`)
		.join('\n\n');

	return `Bạn là trợ lý ghi chú cá nhân (Synapse). Trả lời dựa trên các note dưới đây. Nếu không đủ thông tin, nói rõ không tìm thấy trong ghi chú, không bịa.

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

export async function saveAssistantReply(conversationId: string, text: string) {
	await appendMessage(conversationId, {
		parts: [{ type: 'text', text }],
		id: crypto.randomUUID(),
		role: 'assistant'
	});
}
