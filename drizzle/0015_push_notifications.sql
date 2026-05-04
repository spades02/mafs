ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "push_notifications_opt_in" boolean DEFAULT true NOT NULL;

CREATE TABLE IF NOT EXISTS "device_tokens" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "platform" text NOT NULL,
  "token" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "device_tokens_user_idx" ON "device_tokens" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "device_tokens_user_token_unique" ON "device_tokens" ("user_id", "token");
