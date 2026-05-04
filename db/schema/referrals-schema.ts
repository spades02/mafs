import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

/**
 * Referral records — one row per (referrer, referee) pair, created at
 * referee signup with status='pending'. Lifecycle:
 *   pending     → user signed up via referral link
 *   paid        → user completed first paid checkout (50% off coupon applied)
 *   rewarded    → user paid SECOND invoice (gates against fraud cancellations);
 *                 referrer gets +1 free month at this point
 *   fraudulent  → flagged by anti-fraud check (same IP/email domain, etc.)
 *
 * platform: 'stripe' in v1 — see docs/decisions/referrals-ios.md
 */
export const referrals = pgTable(
  "referrals",
  {
    id: text("id").primaryKey(),
    referrerUserId: text("referrer_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    refereeUserId: text("referee_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .unique(), // a user can only be referred once
    code: text("code").notNull(),
    platform: text("platform").notNull().default("stripe"),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    paidAt: timestamp("paid_at"),
    rewardedAt: timestamp("rewarded_at"),
  },
  (table) => [
    index("referrals_referrer_idx").on(table.referrerUserId),
    index("referrals_status_idx").on(table.status),
    index("referrals_code_idx").on(table.code),
  ],
);
