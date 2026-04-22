ALTER TABLE "saved_plays" ADD COLUMN IF NOT EXISTS "is_favorite" boolean DEFAULT false NOT NULL;
