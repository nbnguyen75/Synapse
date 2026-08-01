import * as d from 'drizzle-orm/pg-core';

export const { table: pgTable } = d.snakeCase;

const { timestamp, boolean, pgEnum, vector, index, jsonb, text, uuid } = d;

export const presetEnum = d.pgEnum('personality_preset', [
	'concise',
	'friendly',
	'professional',
	'socratic',
	'custom'
]);

export const languageEnum = pgEnum('language_pref', ['vi', 'en', 'auto']);
export const responseLengthEnum = pgEnum('response_length', ['short', 'balanced', 'detailed']);
export const roleEnum = pgEnum('message_role', ['user', 'assistant', 'system']);

export const userAiSettings = pgTable('user_ai_settings', {
	updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	responseLength: responseLengthEnum().notNull().default('balanced'),
	language: languageEnum().notNull().default('auto'),
	preset: presetEnum().notNull().default('friendly'),
	useEmoji: boolean().notNull().default(false),
	userId: text().primaryKey(),
	customInstructions: text()
});

export const conversations = pgTable('conversations', {
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	id: uuid().primaryKey().defaultRandom(),
	userId: uuid().notNull(),
	title: text()
});

export const messages = pgTable(
	'messages',
	{
		conversationId: uuid()
			.notNull()
			.references(() => conversations.id, { onDelete: 'cascade' }),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		id: uuid().primaryKey().defaultRandom(),
		role: roleEnum().notNull(),
		parts: jsonb().notNull(), // UIMessagePart[]
		metadata: jsonb() // { model, sourceNotes, ... }
	},
	(t) => [index('messages_conversation_id_idx').on(t.conversationId)]
);

// --- Notes (đọc để RAG, không insert/update từ AI service) ---
export const notes = pgTable(
	'notes',
	{
		id: uuid().primaryKey().defaultRandom(),
		embedding: vector({ dimensions: 768 }), // Gemini embedding-001 = 768 dim
		content: text().notNull(),
		userId: text().notNull(),
		title: text().notNull()
	},
	(t) => [d.index('notes_embedding_idx').using('hnsw', t.embedding.op('vector_cosine_ops'))]
);
