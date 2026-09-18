import { eq, desc, asc } from 'drizzle-orm';

import { conversations, messages } from '@/database/schema';
import { db } from '@/database';

export type NewMessageValues = Pick<
	typeof messages.$inferInsert,
	'searchText' | 'createdAt' | 'metadata' | 'parentId' | 'parts' | 'role' | 'id'
>;

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

export async function insertMessage(
	conversationId: string,
	values: Omit<NewMessageValues, 'createdAt'>
) {
	await db.insert(messages).values({ ...values, conversationId });
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

export async function insertMessagesBulk(conversationId: string, rows: NewMessageValues[]) {
	if (rows.length === 0) return;

	await db.transaction(async (tx) => {
		for (const row of rows) {
			await tx.insert(messages).values({ ...row, conversationId });
		}
	});
}
