import * as d from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const { table: pgTable } = d.snakeCase;

// ==================== Enums ====================

export const presetEnum = d.pgEnum('personality_preset', [
	'concise',
	'friendly',
	'professional',
	'socratic',
	'custom'
]);
export const languageEnum = d.pgEnum('language_pref', ['vi', 'en', 'auto']);
export const responseLengthEnum = d.pgEnum('response_length', ['short', 'balanced', 'detailed']);

export const roleEnum = d.pgEnum('message_role', ['user', 'assistant', 'system', 'data', 'tool']);

// ==================== User AI Settings ====================

export const userAiSettings = pgTable('user_ai_settings', {
	updatedAt: d.timestamp({ withTimezone: true }).notNull().defaultNow(),
	responseLength: responseLengthEnum().notNull().default('balanced'),
	language: languageEnum().notNull().default('auto'),
	preset: presetEnum().notNull().default('friendly'),
	botName: d.text().notNull().default('Synapse'),
	useEmoji: d.boolean().notNull().default(false),
	userId: d.text().primaryKey(),
	customInstructions: d.text()
});

// ==================== Conversations & Messages ====================

export const conversations = pgTable(
	'conversations',
	{
		createdAt: d.timestamp({ withTimezone: true }).notNull().defaultNow(),
		updatedAt: d.timestamp({ withTimezone: true }).notNull().defaultNow(),
		favorited: d.boolean().notNull().default(false),
		id: d.uuid().primaryKey().defaultRandom(),
		userId: d.text().notNull(),
		title: d.text()
	},
	(t) => [d.index('conversations_user_id_idx').on(t.userId)]
);

export type MessageMetadata = {
	tokens?: { outputTokens?: number; inputTokens?: number; totalTokens?: number };
	responseLength?: 'balanced' | 'detailed' | 'short';
	timezoneOffset?: number;
	[key: string]: unknown;
	createdAt?: number;
	timeZone?: string;
	locale?: string;
	model?: string;
};

export const messages = pgTable(
	'messages',
	{
		conversationId: d
			.uuid()
			.notNull()
			.references(() => conversations.id, { onDelete: 'cascade' }),
		createdAt: d.timestamp({ withTimezone: true }).notNull().defaultNow(),
		metadata: d.jsonb().$type<MessageMetadata>(),
		parts: d.jsonb().notNull(),
		role: roleEnum().notNull(),
		id: d.text().primaryKey(),
		searchText: d.text(),
		content: d.text()
	},
	(t) => [
		d.index('messages_conversation_id_idx').on(t.conversationId),
		d.index('messages_search_text_trgm_idx').using('gin', sql`${t.searchText} gin_trgm_ops`)
	]
);

// ==================== Notes (read-only mirror) ====================

export const notes = pgTable('notes', {
	createdAt: d.timestamp({ withTimezone: true }),
	updatedAt: d.timestamp({ withTimezone: true }),
	trashed: d.boolean().notNull().default(false),
	content: d.text().notNull(),
	userId: d.text().notNull(),
	id: d.uuid().primaryKey(),
	title: d.text()
});

// ==================== Note Embeddings ====================

export const noteEmbeddings = pgTable(
	'note_embeddings',
	{
		updatedAt: d.timestamp({ withTimezone: true }).notNull().defaultNow(),
		embedding: d.vector({ dimensions: 768 }),
		noteId: d.uuid().primaryKey(),
		userId: d.text().notNull()
	},
	(t) => [
		d.index('note_embeddings_embedding_idx').using('hnsw', t.embedding.op('vector_cosine_ops')),
		d.index('note_embeddings_user_id_idx').on(t.userId)
	]
);
