import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

/**
 * Contact-support and feedback submissions. Same table for both — `type`
 * distinguishes. Guest submissions allowed (user_id nullable) but the
 * UI only exposes the form to signed-in users initially.
 */
export const supportMessages = pgTable(
  "support_messages",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    type: text("type").notNull(), // "support" | "feedback" | "bug" | "feature_request"
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    emailForReply: text("email_for_reply"),
    status: text("status").notNull().default("open"), // "open" | "triaged" | "closed"
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("support_messages_user_idx").on(table.userId),
    index("support_messages_status_idx").on(table.status),
  ],
);
