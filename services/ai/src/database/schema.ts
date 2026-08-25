import {
	pgTable,
	pgEnum,
	text,
	timestamp,
	boolean,
	uuid,
	jsonb,
	index,
	vector,
	type AnyPgColumn
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

// ==================== Enums ====================

export const presetEnum = pgEnum('personality_preset', [
	'concise',
	'friendly',
	'professional',
	'socratic',
	'custom'
]);
export const languageEnum = pgEnum('language_pref', ['vi', 'en', 'auto']);
export const responseLengthEnum = pgEnum('response_length', ['short', 'balanced', 'detailed']);

export const roleEnum = pgEnum('message_role', ['user', 'assistant', 'system', 'data', 'tool']);

// ==================== User AI Settings ====================

export const userAiSettings = pgTable('user_ai_settings', {
	responseLength: responseLengthEnum('response_length').notNull().default('balanced'),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	language: languageEnum('language').notNull().default('auto'),
	preset: presetEnum('preset').notNull().default('friendly'),
	useEmoji: boolean('use_emoji').notNull().default(false),
	botName: text('bot_name').notNull().default('Synapse'),
	customInstructions: text('custom_instructions'),
	userId: text('user_id').primaryKey()
});

// ==================== Conversations & Messages ====================

export const conversations = pgTable(
	'conversations',
	{
		currentMessageId: text('current_message_id').references((): AnyPgColumn => messages.id, {
			onDelete: 'set null'
		}),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
		favorited: boolean('favorited').notNull().default(false),
		id: uuid('id').primaryKey().defaultRandom(),
		userId: text('user_id').notNull(),
		title: text('title')
	},
	(t) => [index('conversations_user_id_idx').on(t.userId)]
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
		conversationId: uuid('conversation_id')
			.notNull()
			.references(() => conversations.id, { onDelete: 'cascade' }),
		parentId: text('parent_id').references((): AnyPgColumn => messages.id, {
			onDelete: 'cascade'
		}),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		metadata: jsonb('metadata').$type<MessageMetadata>(),
		role: roleEnum('role').notNull(),
		parts: jsonb('parts').notNull(),
		searchText: text('search_text'),
		id: text('id').primaryKey(),
		content: text('content')
	},
	(t) => [
		index('messages_conversation_id_idx').on(t.conversationId),
		index('messages_search_text_trgm_idx').using('gin', sql`${t.searchText} gin_trgm_ops`),
		index('messages_parent_id_idx').on(t.parentId)
	]
);

// ==================== Notes (read-only mirror) ====================

export const notes = pgTable('notes', {
	createdAt: timestamp('created_at', { withTimezone: true }),
	updatedAt: timestamp('updated_at', { withTimezone: true }),
	trashed: boolean('trashed').notNull().default(false),
	content: text('content').notNull(),
	userId: text('user_id').notNull(),
	id: uuid('id').primaryKey(),
	title: text('title')
});

// ==================== Note Embeddings ====================

export const noteEmbeddings = pgTable(
	'note_embeddings',
	{
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
		embedding: vector('embedding', { dimensions: 768 }),
		noteId: uuid('note_id').primaryKey(),
		userId: text('user_id').notNull()
	},
	(t) => [
		index('note_embeddings_embedding_idx').using('hnsw', t.embedding.op('vector_cosine_ops')),
		index('note_embeddings_user_id_idx').on(t.userId)
	]
);

// ==================== Relations ====================

export const conversationsRelations = relations(conversations, ({ many, one }) => ({
	currentMessage: one(messages, {
		fields: [conversations.currentMessageId],
		references: [messages.id]
	}),
	messages: many(messages)
}));

export const messagesRelations = relations(messages, ({ many, one }) => ({
	parent: one(messages, {
		relationName: 'parent_child',
		fields: [messages.parentId],
		references: [messages.id]
	}),
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id]
	}),
	children: many(messages, {
		relationName: 'parent_child'
	})
}));
