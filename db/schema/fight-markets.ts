import { index, pgTable } from "drizzle-orm/pg-core";
import { fights } from "./fights";
// 6️⃣ Fight Markets
export const fightMarkets = pgTable('fight_markets', (t) => ({
    id: t.uuid('id').primaryKey().defaultRandom(),
    
    fightId: t.uuid('fight_id').notNull().references(() => fights.id, { onDelete: 'cascade' }),
    
    bookmaker: t.text('bookmaker'),
    marketType: t.text('market_type', { enum: ['moneyline', 'total', 'handicap', 'prop_main'] }),
    
    openingOddsA: t.numeric('opening_odds_a'),
    openingOddsB: t.numeric('opening_odds_b'),
    closingOddsA: t.numeric('closing_odds_a'),
    closingOddsB: t.numeric('closing_odds_b'),
    currentOddsA: t.numeric('current_odds_a'),
    currentOddsB: t.numeric('current_odds_b'),
    
    liveOddsHistory: t.jsonb('live_odds_history'),
    lineMovementHistory: t.jsonb('line_movement_history'),
    
    handlePctA: t.numeric('handle_pct_a'),
    handlePctB: t.numeric('handle_pct_b'),
    betCountPctA: t.numeric('bet_count_pct_a'),
    betCountPctB: t.numeric('bet_count_pct_b'),
    
    sharpSteamFlags: t.jsonb('sharp_steam_flags'),
    
    maxLimitIndicator: t.text('max_limit_indicator', { enum: ['low', 'medium', 'high', 'unknown'] }),
    
    lastUpdated: t.timestamp('last_updated', { withTimezone: true }).notNull().defaultNow(),
  }), (table) => [
    index('fight_markets_idx').on(table.fightId, table.bookmaker),
  ]);