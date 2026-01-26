import { pgTable, text, timestamp, bigint } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
    eventId: text("event_id").primaryKey(),
    name: text("name").notNull(),
    dateTime: timestamp("date_time"),
    venue: text("venue"),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});
