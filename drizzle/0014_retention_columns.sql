ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "last_login_at" timestamp;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "last_sim_at" timestamp;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "last_retention_email_at" timestamp;
