import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),

  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),

  // 🔐 Auth
  passwordHash: text("password_hash"),
  image: text("image"),

  // 💳 Stripe
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  subscriptionStatus: text("subscription_status"),
  // e.g. "active", "canceled", "past_due", "expired"

  // 🍎 RevenueCat (Apple IAP)
  rcCustomerId: text("rc_customer_id").unique(),
  subscriptionPlatform: text("subscription_platform"), // "stripe" | "revenuecat"
  subscriptionExpiresAt: timestamp("subscription_expires_at"),

  // 💰 Access control
  isPro: boolean("is_pro").default(false).notNull(),
  analysisCount: integer("analysis_count").default(0).notNull(),
  // First 100 paid users — locked at $39 founding price indefinitely.
  // Set true by Stripe / RevenueCat webhook on first paid event when current
  // count of founding_member=true users is < 100.
  foundingMember: boolean("founding_member").default(false).notNull(),
  // Free-tier weekly retention drip — independent of analysisCount (which is
  // lifetime). Set when user claims the weekly free pick from a retention
  // email; reset to null by the weekly retention cron at start of each week.
  weeklyFreePickUsedAt: timestamp("weekly_free_pick_used_at"),

  // Referral system. `referralCode` is this user's *own* shareable code,
  // generated at signup. `referredByCode` is captured at signup when the
  // visitor arrived via /api/referrals/[code] (cookie-backed).
  referralCode: text("referral_code").unique(),
  referredByCode: text("referred_by_code"),

  // Retention tracking — feeds the weekly free-tier reactivation cron.
  // last_login_at: bumped on each session creation via better-auth hook.
  // last_sim_at: bumped when analysisCount increments (POST /api/agents).
  // last_retention_email_at: enforces the max-1-email-per-week frequency cap.
  lastLoginAt: timestamp("last_login_at"),
  lastSimAt: timestamp("last_sim_at"),
  lastRetentionEmailAt: timestamp("last_retention_email_at"),

  // ⚙️ Settings
  timeZone: text("time_zone").default("America/New_York (EST)").notNull(),
  oddsFormat: text("odds_format").default("american").notNull(),
  emailAlerts: boolean("email_alerts").default(true).notNull(),
  riskWarnings: boolean("risk_warnings").default(true).notNull(),

  // ⏱️ Meta
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});


export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
