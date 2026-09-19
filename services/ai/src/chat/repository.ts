import { and, desc, eq, sql } from 'drizzle-orm';

import { messages, notes } from '@/database/schema';
import { db } from '@/database';

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
        id: messages.id,
      })
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, conversationId),
          sql`unaccent(${messages.searchText}) ILIKE unaccent(${searchPattern})`,
        ),
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
 * Tier 1 (Fast-Path Full-Text Search): lightweight PostgreSQL FTS query (~3ms).
 * Pure DB — no embedding calls. The caller decides whether the hit count
 * satisfies the requested limit before paying for Tier 2.
 */
export async function searchNotesByFts({
  limit = 5,
  userId,
  query,
}: {
  limit?: number;
  userId: string;
  query: string;
}) {
  const fastFtsQuery = sql`
    SELECT id, title, content, updated_at AS "updatedAt"
    FROM ${notes}
    WHERE user_id = ${userId}
      AND trashed = false
      AND to_tsvector('simple', title || ' ' || content) @@ plainto_tsquery('simple', ${query})
    ORDER BY ts_rank_cd(to_tsvector('simple', title || ' ' || content), plainto_tsquery('simple', ${query})) DESC
    LIMIT ${limit};
  `;

  try {
    const fastResults = await db.execute<SearchNoteItem>(fastFtsQuery);

    return fastResults.rows.map((row) => ({
      ...row,
      updatedAt: new Date(row.updatedAt),
    }));
  } catch (error) {
    console.warn('[searchNotesByFts] Tier 1 Fast-Path FTS error:', error);
    return [];
  }
}

/**
 * Tier 2 (Postgres Native RRF): blends Full-Text BM25 ranking (`ts_rank_cd`)
 * with Vector Cosine Distance (`<=>`) via Reciprocal Rank Fusion.
 * Pure DB — the caller supplies a precomputed query embedding.
 */
export async function searchNotesByRrf({
  embedding,
  limit = 5,
  userId,
  query,
}: {
  embedding: Array<number>;
  limit?: number;
  userId: string;
  query: string;
}) {
  const vectorSql = `[${embedding.join(',')}]`;

  const rrfQuery = sql`
      WITH fts_matches AS (
        SELECT 
          id,
          ROW_NUMBER() OVER (
            ORDER BY ts_rank_cd(
              to_tsvector('simple', title || ' ' || content), 
              plainto_tsquery('simple', ${query})
            ) DESC
          ) AS rank_fts
        FROM ${notes}
        WHERE user_id = ${userId} 
          AND trashed = false 
          AND to_tsvector('simple', title || ' ' || content) @@ plainto_tsquery('simple', ${query})
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

  try {
    const result = await db.execute<{ rrf_score: number } & SearchNoteItem>(rrfQuery);

    return result.rows.map((row) => ({
      updatedAt: new Date(row.updatedAt),
      content: row.content,
      title: row.title,
      id: row.id,
    }));
  } catch (error) {
    console.error('[searchNotesByRrf] Tier 2 RRF error:', error);
    return [];
  }
}

export async function getRecentNotes(userId: string, limit: number) {
  return db
    .select({
      updatedAt: notes.updatedAt,
      content: notes.content,
      title: notes.title,
      id: notes.id,
    })
    .from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.trashed, false)))
    .orderBy(desc(notes.updatedAt))
    .limit(limit);
}
