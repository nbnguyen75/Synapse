CREATE TYPE "public"."language_pref" AS ENUM('vi', 'en', 'auto');--> statement-breakpoint
CREATE TYPE "public"."personality_preset" AS ENUM('concise', 'friendly', 'professional', 'socratic', 'custom');--> statement-breakpoint
CREATE TYPE "public"."response_length" AS ENUM('short', 'balanced', 'detailed');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant', 'system', 'data', 'tool');--> statement-breakpoint
CREATE TABLE "conversations" (
	"current_message_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"favorited" boolean DEFAULT false NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"conversation_id" uuid NOT NULL,
	"parent_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb,
	"role" "message_role" NOT NULL,
	"parts" jsonb NOT NULL,
	"search_text" text,
	"id" text PRIMARY KEY NOT NULL,
	"content" text
);
--> statement-breakpoint
CREATE TABLE "note_embeddings" (
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"embedding" vector(768),
	"note_id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"trashed" boolean DEFAULT false NOT NULL,
	"content" text NOT NULL,
	"user_id" text NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text
);
--> statement-breakpoint
CREATE TABLE "user_ai_settings" (
	"response_length" "response_length" DEFAULT 'balanced' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"language" "language_pref" DEFAULT 'auto' NOT NULL,
	"preset" "personality_preset" DEFAULT 'friendly' NOT NULL,
	"use_emoji" boolean DEFAULT false NOT NULL,
	"bot_name" text DEFAULT 'Synapse' NOT NULL,
	"custom_instructions" text,
	"user_id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_current_message_id_messages_id_fk" FOREIGN KEY ("current_message_id") REFERENCES "public"."messages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_parent_id_messages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversations_user_id_idx" ON "conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "messages_conversation_id_idx" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "messages_search_text_trgm_idx" ON "messages" USING gin ("search_text" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "messages_parent_id_idx" ON "messages" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "note_embeddings_embedding_idx" ON "note_embeddings" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "note_embeddings_user_id_idx" ON "note_embeddings" USING btree ("user_id");