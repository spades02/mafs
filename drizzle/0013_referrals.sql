ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "referral_code" text UNIQUE;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "referred_by_code" text;

CREATE TABLE IF NOT EXISTS "referrals" (
  "id" text PRIMARY KEY NOT NULL,
  "referrer_user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "referee_user_id" text NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
  "code" text NOT NULL,
  "platform" text DEFAULT 'stripe' NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "paid_at" timestamp,
  "rewarded_at" timestamp
);
CREATE INDEX IF NOT EXISTS "referrals_referrer_idx" ON "referrals" ("referrer_user_id");
CREATE INDEX IF NOT EXISTS "referrals_status_idx" ON "referrals" ("status");
CREATE INDEX IF NOT EXISTS "referrals_code_idx" ON "referrals" ("code");
