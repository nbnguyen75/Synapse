import type { UIMessage } from 'ai';

import {
	create,
	findAllByUserId,
	findById,
	findMessages,
	insertMessage,
	touch
} from '@/conversation/repository';
import { ForbiddenError, NotFoundError } from '@/lib/errors';

export async function getOrCreateConversation(userId: string, conversationId?: string) {
	if (!conversationId) {
		return await create(userId);
	}

	const conversation = await findById(conversationId);
	if (!conversation) {
		throw new NotFoundError('Cuộc trò chuyện không tồn tại');
	}
	if (conversation.userId !== userId) {
		throw new ForbiddenError('Bạn không có quyền truy cập cuộc trò chuyện này');
	}

	return conversation;
}

export async function checkConversationOwnership(userId: string, conversationId: string) {
	const conversation = await findById(conversationId);

	if (!conversation) {
		throw new NotFoundError('Cuộc trò chuyện không tồn tại');
	}
	if (conversation.userId !== userId) {
		throw new ForbiddenError('Bạn không có quyền truy cập cuộc trò chuyện này');
	}

	return conversation;
}

export async function listConversations(userId: string) {
	return findAllByUserId(userId);
}

export async function loadHistory(conversationId: string): Promise<UIMessage[]> {
	const rows = await findMessages(conversationId);

	return rows.map((r) => ({
		parts: r.parts as UIMessage['parts'],
		metadata: r.metadata ?? undefined,
		role: r.role as UIMessage['role'],
		id: r.id
	}));
}

export async function appendMessage(conversationId: string, message: UIMessage) {
	await insertMessage(conversationId, message);
	await touch(conversationId);
}
