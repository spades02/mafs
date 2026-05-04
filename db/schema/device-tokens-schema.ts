import { pgTable, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

/**
 * One row per (user, platform, token). Token is the APNs device token in
 * v1 (lowercase hex string). When an iOS user reinstalls or signs into a
 * different account, a new token comes in and we upsert by (userId, token).
 *
 * Stale-token cleanup: APNs returns 410 Gone when a token is invalidated
 * (uninstall, etc.) — the send helper deletes those rows.
 */
export const deviceTokens = pgTable(
  "device_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(), // "apns" | "fcm" (future)
    token: text("token").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("device_tokens_user_idx").on(table.userId),
    uniqueIndex("device_tokens_user_token_unique").on(table.userId, table.token),
  ],
);
