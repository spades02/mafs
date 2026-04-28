ALTER TABLE "saved_plays" ADD COLUMN IF NOT EXISTS "outcome" text;
ALTER TABLE "saved_plays" ADD COLUMN IF NOT EXISTS "graded_at" timestamp;
ALTER TABLE "saved_plays" ADD COLUMN IF NOT EXISTS "fight_settlement_id" text;
