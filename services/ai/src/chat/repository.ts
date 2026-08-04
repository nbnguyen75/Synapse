import { and, cosineDistance, desc, eq, ilike, or, sql } from 'drizzle-orm';

import { messages, noteEmbeddings, notes } from '@/database/schema';
import { embedText } from '@/lib/ai';
import { db } from '@/database';

export type SimilarNote = {
	title: string | null;
	similarity: number;
	content: string;
	id: string;
};

/**
 * @deprecated
 * @param userId
 * @param queryEmbedding
 * @param k
 * @returns
 */
export async function findTopKSimilarNotes(
	userId: string,
	queryEmbedding: number[],
	k: number
): Promise<SimilarNote[]> {
	if (!queryEmbedding.length || k <= 0) {
		return [];
	}

	const distance = cosineDistance(noteEmbeddings.embedding, queryEmbedding);
	const similarity = sql<number>`1 - ${distance}`;

	return db
		.select({
			content: notes.content,
			title: notes.title,
			id: notes.id,
			similarity
		})
		.from(noteEmbeddings)
		.innerJoin(notes, eq(noteEmbeddings.noteId, notes.id))
		.where(and(eq(noteEmbeddings.userId, userId), eq(notes.trashed, false)))
		.orderBy(distance)
		.limit(k);
}

export async function searchOlderMessages(conversationId: string, query: string, limit = 5) {
	const trimmedQuery = query.trim();

	// Guard check: Tránh query thừa nếu input không hợp lệ
	if (!trimmedQuery || !conversationId) {
		return [];
	}

	const searchPattern = `%${trimmedQuery}%`;

	return db
		.select({
			createdAt: messages.createdAt,
			parts: messages.parts,
			role: messages.role,
			id: messages.id
		})
		.from(messages)
		.where(
			and(
				eq(messages.conversationId, conversationId),
				sql`${messages.parts}::text ILIKE ${searchPattern}`
			)
		)
		.orderBy(desc(messages.createdAt))
		.limit(limit);
}

export async function searchNotesHybrid({
	limit = 5,
	userId,
	query
}: {
	limit?: number;
	userId: string;
	query: string;
}) {
	const trimmedQuery = query.trim();
	if (!userId) return [];

	if (!trimmedQuery) {
		return getRecentNotes(userId, limit);
	}

	// 1. TẦNG 1: Keyword Search (ILIKE)
	const searchPattern = `%${trimmedQuery}%`;
	const keywordResults = await db
		.select({
			updatedAt: notes.updatedAt,
			content: notes.content,
			title: notes.title,
			id: notes.id
		})
		.from(notes)
		.where(
			and(
				eq(notes.userId, userId),
				eq(notes.trashed, false),
				or(ilike(notes.title, searchPattern), ilike(notes.content, searchPattern))
			)
		)
		.orderBy(desc(notes.updatedAt))
		.limit(limit);

	if (keywordResults.length > 0) {
		return keywordResults;
	}

	// 2. TẦNG 2: Vector Search (Dùng embedText của bạn)
	try {
		// 💡 Gọi hàm embedText tại đây
		const queryEmbedding = await embedText(trimmedQuery);

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (queryEmbedding && queryEmbedding.length > 0) {
			const distance = cosineDistance(noteEmbeddings.embedding, queryEmbedding);

			const vectorResults = await db
				.select({
					updatedAt: notes.updatedAt,
					content: notes.content,
					title: notes.title,
					id: notes.id
				})
				.from(noteEmbeddings)
				.innerJoin(notes, eq(noteEmbeddings.noteId, notes.id))
				.where(and(eq(noteEmbeddings.userId, userId), eq(notes.trashed, false)))
				.orderBy(distance)
				.limit(limit);

			if (vectorResults.length > 0) {
				return vectorResults;
			}
		}
	} catch (error) {
		console.error('[searchNotesHybrid] Vector search error:', error);
	}

	// 3. TẦNG 3: Fallback lấy các note mới nhất
	return getRecentNotes(userId, limit);
}

async function getRecentNotes(userId: string, limit: number) {
	return db
		.select({
			updatedAt: notes.updatedAt,
			content: notes.content,
			title: notes.title,
			id: notes.id
		})
		.from(notes)
		.where(and(eq(notes.userId, userId), eq(notes.trashed, false)))
		.orderBy(desc(notes.updatedAt))
		.limit(limit);
}
