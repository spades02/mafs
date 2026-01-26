import { pgTable, text, timestamp, integer, uuid } from "drizzle-orm/pg-core";

export const historicalOdds = pgTable("historical_odds", {
    id: uuid("id").primaryKey(),
    fightId: text("fight_id"),
    fighterId: text("fighter_id"),
    bookmaker: text("bookmaker"),
    moneyline: integer("moneyline"),
    timestamp: timestamp("timestamp", { withTimezone: true }),
});
