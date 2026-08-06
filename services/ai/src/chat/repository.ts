import { and, desc, eq, sql } from 'drizzle-orm';

import { messages, notes } from '@/database/schema';
import { embedText } from '@/lib/ai';
import { db } from '@/database';

export type SimilarNote = {
	title: string | null;
	similarity: number;
	content: string;
	id: string;
};

/**
 * Searches older messages within a specific conversation.
 * Supports both English and accent-insensitive Vietnamese queries (< 5ms response time).
 */
export async function searchOlderMessages(conversationId: string, query: string, limit = 5) {
	const trimmedQuery = query.trim();

	if (!trimmedQuery || !conversationId) {
		return [];
	}

	const searchPattern = `%${trimmedQuery}%`;

	try {
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
					sql`unaccent(${messages.searchText}) ILIKE unaccent(${searchPattern})`
				)
			)
			.orderBy(desc(messages.createdAt))
			.limit(limit);
	} catch (error) {
		console.error('[searchOlderMessages] Query error:', error);
		return [];
	}
}

export interface SearchNoteItem extends Record<string, unknown> {
	content: string;
	updatedAt: Date;
	title: string;
	id: string;
}

/**
 * Performs a hybrid search across user notes using a two-tier execution strategy:
 *
 * 1. Tier 1 (Fast-Path Full-Text Search): Executes a lightweight PostgreSQL FTS query (\~3ms).
 *    If the returned record count satisfies the requested limit, the function returns immediately,
 *    bypassing the Embedding API HTTP round-trip (\~150-300ms) to significantly reduce TTFT.
 *
 * 2. Tier 2 (Postgres Native RRF Search): If Tier 1 yields insufficient results, it generates a query
 *    embedding and executes a unified PostgreSQL CTE using Reciprocal Rank Fusion (RRF).
 *    This blends Full-Text BM25 ranking (`ts_rank_cd`) with Vector Cosine Distance (`<=>`).
 */
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
	if (!trimmedQuery) return getRecentNotes(userId, limit);

	// ---------------------------------------------------------------------------
	// TIER 1: FAST-PATH (Full-Text Search for Instant Early-Exit & Low TTFT)
	// ---------------------------------------------------------------------------

	const fastFtsQuery = sql`
    SELECT id, title, content, updated_at AS "updatedAt"
    FROM ${notes}
    WHERE user_id = ${userId}
      AND trashed = false
      AND to_tsvector('simple', title || ' ' || content) @@ plainto_tsquery('simple', ${trimmedQuery})
    ORDER BY ts_rank_cd(to_tsvector('simple', title || ' ' || content), plainto_tsquery('simple', ${trimmedQuery})) DESC
    LIMIT ${limit};
  `;

	try {
		const fastResults = await db.execute<SearchNoteItem>(fastFtsQuery);

		if (fastResults.rows.length >= limit) {
			return fastResults.rows.map((row) => ({
				...row,
				updatedAt: new Date(row.updatedAt)
			}));
		}
	} catch (error) {
		console.warn(
			'[searchNotesHybrid] Tier 1 Fast-Path FTS error, falling back to Tier 2:',
			error
		);
	}

	// ---------------------------------------------------------------------------
	// TIER 2: POSTGRES NATIVE RRF (Full-Text + Vector Cosine Distance Hybrid)
	// ---------------------------------------------------------------------------
	try {
		const queryEmbedding = await embedText(trimmedQuery);

		if (!queryEmbedding || queryEmbedding.length === 0) {
			return getRecentNotes(userId, limit);
		}

		const vectorSql = `[${queryEmbedding.join(',')}]`;

		const rrfQuery = sql`
      WITH fts_matches AS (
        SELECT 
          id,
          ROW_NUMBER() OVER (
            ORDER BY ts_rank_cd(
              to_tsvector('simple', title || ' ' || content), 
              plainto_tsquery('simple', ${trimmedQuery})
            ) DESC
          ) AS rank_fts
        FROM ${notes}
        WHERE user_id = ${userId} 
          AND trashed = false 
          AND to_tsvector('simple', title || ' ' || content) @@ plainto_tsquery('simple', ${trimmedQuery})
        LIMIT 20
      ),
      vec_matches AS (
        SELECT 
          note_id AS id,
          ROW_NUMBER() OVER (ORDER BY embedding <=> ${vectorSql}::vector) AS rank_vec
        FROM note_embeddings
        WHERE user_id = ${userId}
        LIMIT 20
      )
      SELECT 
        n.id,
        n.title,
        n.content,
        n.updated_at AS "updatedAt",
        (COALESCE(1.0 / (60 + fts.rank_fts), 0.0) + COALESCE(1.0 / (60 + vec.rank_vec), 0.0)) AS rrf_score
      FROM ${notes} n
      LEFT JOIN fts_matches fts ON n.id = fts.id
      LEFT JOIN vec_matches vec ON n.id = vec.id
      WHERE fts.id IS NOT NULL OR vec.id IS NOT NULL
      ORDER BY rrf_score DESC
      LIMIT ${limit};
    `;

		const result = await db.execute<{ rrf_score: number } & SearchNoteItem>(rrfQuery);

		if (result.rows.length === 0) {
			return getRecentNotes(userId, limit);
		}

		return result.rows.map((row) => ({
			updatedAt: new Date(row.updatedAt),
			content: row.content,
			title: row.title,
			id: row.id
		}));
	} catch (error) {
		console.error('[searchNotesHybrid] Tier 2 RRF error:', error);
		return getRecentNotes(userId, limit);
	}
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
