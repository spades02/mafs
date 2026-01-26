import { pgTable, text, timestamp, doublePrecision } from "drizzle-orm/pg-core";

export const fighters = pgTable("fighters", {
    id: text("id").primaryKey(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    nickname: text("nickname"),
    stance: text("stance"),
    reachIn: doublePrecision("reach_in"),
    heightIn: doublePrecision("height_in"),
    createdAt: timestamp("created_at", { withTimezone: true }),
});
