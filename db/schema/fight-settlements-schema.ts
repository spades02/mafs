import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { fights } from "./fights-schema";

export const fightSettlements = pgTable("fight_settlements", {
  id: text("id").primaryKey(),
  fightId: text("fight_id")
    .notNull()
    .unique()
    .references(() => fights.id),
  eventId: text("event_id"),
  winnerId: text("winner_id"),
  method: text("method"),
  round: integer("round"),
  wentDistance: boolean("went_distance"),
  closingOddsA: integer("closing_odds_a"),
  closingOddsB: integer("closing_odds_b"),
  settledAt: timestamp("settled_at").defaultNow().notNull(),
  dataSource: text("data_source").notNull(),
});
