import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
    eventId: integer("event_id").primaryKey(), // From SportsData API
    name: text("name").notNull(),
    dateTime: timestamp("date_time"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
