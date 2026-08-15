import type { UIMessage } from 'ai';

import { eq, desc, asc } from 'drizzle-orm';

import { conversations, messages, type MessageMetadata } from '@/database/schema';
import { db } from '@/database';

export async function findConversationById(id: string) {
	const [row] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!row) return null;

	return row;
}

export async function findAllConversationByUserId(userId: string) {
	return db
		.select()
		.from(conversations)
		.where(eq(conversations.userId, userId))
		.orderBy(desc(conversations.updatedAt));
}

export async function createNewConversation(userId: string) {
	const [row] = await db.insert(conversations).values({ userId }).returning();
	return row;
}

export async function updateLastSavedConversation(id: string) {
	await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, id));
}

export async function updateConversationTitle(id: string, title: string) {
	await db
		.update(conversations)
		.set({ updatedAt: new Date(), title })
		.where(eq(conversations.id, id));
}

export async function updateFavoriteConversation(id: string, favorited: boolean) {
	await db.update(conversations).set({ favorited }).where(eq(conversations.id, id));
}

export async function deletePermanentConversation(id: string) {
	await db.delete(conversations).where(eq(conversations.id, id));
}

export async function findMessagesByConversationId(conversationId: string) {
	return db
		.select()
		.from(messages)
		.where(eq(messages.conversationId, conversationId))
		.orderBy(asc(messages.createdAt));
}

export async function findMessagesByConversationIdPage(
	conversationId: string,
	limit: number,
	offset: number
) {
	return db
		.select()
		.from(messages)
		.where(eq(messages.conversationId, conversationId))
		.orderBy(desc(messages.createdAt))
		.limit(limit)
		.offset(offset);
}

function extractPlainTextFromParts(parts: UIMessage['parts']): string {
	if (!Array.isArray(parts)) return '';
	return parts
		.filter((p) => p.type === 'text' && 'text' in p && typeof p.text === 'string')
		.map((p) => (p as { text: string; type: 'text' }).text.trim())
		.filter(Boolean)
		.join(' ')
		.trim();
}

export async function insertMessage(
	conversationId: string,
	message: UIMessage,
	parentId?: string | null
) {
	const plainText = extractPlainTextFromParts(message.parts);

	await db.insert(messages).values({
		metadata: message.metadata as MessageMetadata | null,
		searchText: plainText,
		parts: message.parts,
		role: message.role,
		conversationId,
		id: message.id,
		parentId
	});
}

export async function findMessageById(id: string) {
	const [row] = await db.select().from(messages).where(eq(messages.id, id)).limit(1);

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!row) return null;

	return row;
}

export async function updateCurrentMessage(id: string, messageId: string) {
	await db
		.update(conversations)
		.set({ currentMessageId: messageId, updatedAt: new Date() })
		.where(eq(conversations.id, id));
}

export async function createConversationWithId(values: {
	title?: string | null;
	favorited?: boolean;
	userId: string;
	id: string;
}) {
	const [row] = await db.insert(conversations).values(values).returning();
	return row;
}

export async function insertMessagesBulk(
	conversationId: string,
	rows: Array<{
		metadata: MessageMetadata | null;
		parts: UIMessage['parts'];
		parentId: string | null;
		createdAt: Date;
		role: string;
		id: string;
	}>
) {
	if (rows.length === 0) return;

	await db.transaction(async (tx) => {
		for (const row of rows) {
			await tx.insert(messages).values({
				searchText: extractPlainTextFromParts(row.parts),
				role: row.role as UIMessage['role'],
				createdAt: row.createdAt,
				metadata: row.metadata,
				parentId: row.parentId,
				parts: row.parts,
				conversationId,
				id: row.id
			});
		}
	});
}
