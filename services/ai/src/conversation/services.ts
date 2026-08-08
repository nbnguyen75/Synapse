import type { UIMessage } from 'ai';

import {
	createNewConversation,
	findAllConversationByUserId,
	findConversationById,
	findMessagesByConversationId,
	insertMessage,
	deletePermanentConversation,
	updateLastSavedConversation,
	updateFavoriteConversation,
	updateConversationTitle
} from '@/conversation/repository';
import { ForbiddenError, NotFoundError } from '@/lib/errors';

export async function getOrCreateConversation(userId: string, conversationId?: string) {
	if (!conversationId) {
		return await createNewConversation(userId);
	}

	const conversation = await findConversationById(conversationId);
	if (!conversation) {
		throw new NotFoundError('Cuộc trò chuyện không tồn tại');
	}
	if (conversation.userId !== userId) {
		throw new ForbiddenError('Bạn không có quyền truy cập cuộc trò chuyện này');
	}

	return conversation;
}

export async function checkConversationOwnership(userId: string, conversationId: string) {
	const conversation = await findConversationById(conversationId);

	if (!conversation) {
		throw new NotFoundError('Cuộc trò chuyện không tồn tại');
	}
	if (conversation.userId !== userId) {
		throw new ForbiddenError('Bạn không có quyền truy cập cuộc trò chuyện này');
	}

	return conversation;
}

export async function listConversations(userId: string) {
	return findAllConversationByUserId(userId);
}

export async function renameConversation(userId: string, conversationId: string, title: string) {
	await checkConversationOwnership(userId, conversationId);
	await updateConversationTitle(conversationId, title);
}

export async function deleteConversation(userId: string, conversationId: string) {
	await checkConversationOwnership(userId, conversationId);
	await deletePermanentConversation(conversationId);
}

export async function setConversationFavorite(
	userId: string,
	conversationId: string,
	favorited: boolean
) {
	await checkConversationOwnership(userId, conversationId);
	await updateFavoriteConversation(conversationId, favorited);
}

export async function loadHistory(conversationId: string): Promise<UIMessage[]> {
	const rows = await findMessagesByConversationId(conversationId);

	return rows.map((r) => ({
		parts: r.parts as UIMessage['parts'],
		metadata: r.metadata ?? undefined,
		role: r.role as UIMessage['role'],
		id: r.id
	}));
}

export async function appendMessage(conversationId: string, message: UIMessage) {
	await insertMessage(conversationId, message);
	await updateLastSavedConversation(conversationId);
}
