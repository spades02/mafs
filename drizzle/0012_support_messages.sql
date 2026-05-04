CREATE TABLE IF NOT EXISTS "support_messages" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "type" text NOT NULL,
  "subject" text NOT NULL,
  "body" text NOT NULL,
  "email_for_reply" text,
  "status" text DEFAULT 'open' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "support_messages_user_idx" ON "support_messages" ("user_id");
CREATE INDEX IF NOT EXISTS "support_messages_status_idx" ON "support_messages" ("status");
