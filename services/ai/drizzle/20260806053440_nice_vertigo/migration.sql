CREATE TYPE "language_pref" AS ENUM('vi', 'en', 'auto');--> statement-breakpoint
CREATE TYPE "personality_preset" AS ENUM('concise', 'friendly', 'professional', 'socratic', 'custom');--> statement-breakpoint
CREATE TYPE "response_length" AS ENUM('short', 'balanced', 'detailed');--> statement-breakpoint
CREATE TYPE "message_role" AS ENUM('user', 'assistant', 'system', 'data', 'tool');--> statement-breakpoint
CREATE TABLE "conversations" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"title" text
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"conversation_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb,
	"parts" jsonb NOT NULL,
	"role" "message_role" NOT NULL,
	"id" text PRIMARY KEY,
	"search_text" text,
	"content" text
);
--> statement-breakpoint
CREATE TABLE "note_embeddings" (
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"embedding" vector(768),
	"note_id" uuid PRIMARY KEY,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"trashed" boolean DEFAULT false NOT NULL,
	"content" text NOT NULL,
	"user_id" text NOT NULL,
	"id" uuid PRIMARY KEY,
	"title" text
);
--> statement-breakpoint
CREATE TABLE "user_ai_settings" (
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"response_length" "response_length" DEFAULT 'balanced'::"response_length" NOT NULL,
	"language" "language_pref" DEFAULT 'auto'::"language_pref" NOT NULL,
	"preset" "personality_preset" DEFAULT 'friendly'::"personality_preset" NOT NULL,
	"bot_name" text DEFAULT 'Synapse' NOT NULL,
	"use_emoji" boolean DEFAULT false NOT NULL,
	"user_id" text PRIMARY KEY,
	"custom_instructions" text
);
--> statement-breakpoint
CREATE INDEX "conversations_user_id_idx" ON "conversations" ("user_id");--> statement-breakpoint
CREATE INDEX "messages_conversation_id_idx" ON "messages" ("conversation_id");--> statement-breakpoint
CREATE INDEX "messages_search_text_trgm_idx" ON "messages" USING gin ("search_text" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "note_embeddings_embedding_idx" ON "note_embeddings" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "note_embeddings_user_id_idx" ON "note_embeddings" ("user_id");--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE;