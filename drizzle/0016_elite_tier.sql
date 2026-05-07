ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "subscription_tier" text DEFAULT 'free' NOT NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "is_elite" boolean DEFAULT false NOT NULL;

UPDATE "user" SET "subscription_tier" = 'pro' WHERE "is_pro" = true AND "subscription_tier" = 'free';
