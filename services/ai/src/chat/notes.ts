import { getRecentNotes, searchNotesByFts, searchNotesByRrf } from '@/chat/repository';
import { embedText } from '@/lib/ai';

/**
 * Two-tier notes search orchestration: Tier 1 FTS fast-path first (skips the
 * ~150-300ms embedding round-trip when it already satisfies the limit),
 * otherwise Tier 2 Postgres native RRF, falling back to recent notes.
 */
export async function searchUserNotes({
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

	const fastHits = await searchNotesByFts({ query: trimmedQuery, userId, limit });
	if (fastHits.length >= limit) return fastHits;

	const queryEmbedding = await embedText(trimmedQuery);
	if (!queryEmbedding || queryEmbedding.length === 0) {
		return getRecentNotes(userId, limit);
	}

	const rrfHits = await searchNotesByRrf({
		embedding: queryEmbedding,
		query: trimmedQuery,
		userId,
		limit
	});
	if (rrfHits.length === 0) return getRecentNotes(userId, limit);

	return rrfHits;
}
