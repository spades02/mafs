ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "founding_member" boolean DEFAULT false NOT NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "weekly_free_pick_used_at" timestamp;
