import type { UIMessage } from 'ai';

import { eq, desc, asc } from 'drizzle-orm';

import { conversations, messages, type MessageMetadata } from '@/database/schema';
import { db } from '@/database';

export async function findById(id: string) {
	const [row] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!row) return null;

	return row;
}

export async function findAllByUserId(userId: string) {
	return db
		.select()
		.from(conversations)
		.where(eq(conversations.userId, userId))
		.orderBy(desc(conversations.updatedAt));
}

export async function create(userId: string) {
	const [row] = await db.insert(conversations).values({ userId }).returning();
	return row;
}

export async function touch(id: string) {
	await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, id));
}

export async function findMessages(conversationId: string) {
	return db
		.select()
		.from(messages)
		.where(eq(messages.conversationId, conversationId))
		.orderBy(asc(messages.createdAt));
}

function extractPlainTextFromParts(parts: UIMessage['parts']): string {
	if (!Array.isArray(parts)) return '';
	return parts
		.filter((p) => p.type === 'text' && 'text' in p && typeof p.text === 'string')
		.map((p) => (p as { text: string; type: 'text' }).text)
		.join(' ')
		.trim();
}

export async function insertMessage(conversationId: string, message: UIMessage) {
	const plainText = extractPlainTextFromParts(message.parts);

	await db.insert(messages).values({
		metadata: message.metadata as MessageMetadata | null,
		searchText: plainText,
		parts: message.parts,
		role: message.role,
		conversationId,
		id: message.id
	});
}
