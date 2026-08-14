ALTER TABLE "conversations" ADD COLUMN "current_message_id" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "parent_id" text;--> statement-breakpoint
CREATE INDEX "messages_parent_id_idx" ON "messages" ("parent_id");--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_current_message_id_messages_id_fkey" FOREIGN KEY ("current_message_id") REFERENCES "messages"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_parent_id_messages_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "messages"("id") ON DELETE CASCADE;--> statement-breakpoint

UPDATE "messages" AS m
SET "parent_id" = lag_rows.prev_id
FROM (
	SELECT "id", lag("id") OVER (PARTITION BY "conversation_id" ORDER BY "created_at", "id") AS prev_id
	FROM "messages"
) AS lag_rows
WHERE m."id" = lag_rows."id"
	AND m."parent_id" IS NULL
	AND lag_rows.prev_id IS NOT NULL;--> statement-breakpoint

UPDATE "conversations" AS c
SET "current_message_id" = last_msg."id"
FROM (
	SELECT DISTINCT ON ("conversation_id") "conversation_id", "id"
	FROM "messages"
	ORDER BY "conversation_id", "created_at" DESC, "id" DESC
) AS last_msg
WHERE c."id" = last_msg."conversation_id";