import type { UIMessage } from 'ai';

import {
	create,
	findAllByUserId,
	findById,
	findMessages,
	insertMessage,
	touch
} from '@/conversation/repository';

export async function getOrCreateConversation(userId: string, conversationId?: string) {
	if (!conversationId) {
		const conversation = await create(userId);
		return { success: true as const, data: conversation };
	}

	const conversation = await findById(conversationId);
	if (!conversation) return { reason: 'not_found' as const, success: false as const };
	if (conversation.userId !== userId)
		return { reason: 'forbidden' as const, success: false as const };

	return { success: true as const, data: conversation };
}

export async function checkConversationOwnership(userId: string, conversationId: string) {
	const conversation = await findById(conversationId);

	if (!conversation) return { reason: 'not_found' as const, success: false as const };
	if (conversation.userId !== userId)
		return { reason: 'forbidden' as const, success: false as const };

	return { success: true as const, data: conversation };
}

export async function listConversations(userId: string) {
	return findAllByUserId(userId);
}

export async function loadHistory(conversationId: string): Promise<UIMessage[]> {
	const rows = await findMessages(conversationId);

	return rows.map((r) => ({
		parts: r.parts as UIMessage['parts'],
		metadata: r.metadata ?? undefined,
		role: r.role,
		id: r.id
	}));
}

export async function appendMessage(conversationId: string, message: UIMessage) {
	await insertMessage(conversationId, message);
	await touch(conversationId);
}
