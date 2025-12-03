import { index, pgTable } from "drizzle-orm/pg-core";
import { fights } from "./fights";
import { fighterProfiles } from "./fighter-profiles";

// 3️⃣ Round Stats
export const roundStats = pgTable('round_stats', (t) => ({
    id: t.uuid('id').primaryKey().defaultRandom(),
    
    fightId: t.uuid('fight_id').notNull().references(() => fights.id, { onDelete: 'cascade' }),
    roundNumber: t.smallint('round_number').notNull(),
    
    fighterId: t.uuid('fighter_id').notNull().references(() => fighterProfiles.id, { onDelete: 'cascade' }),
    opponentId: t.uuid('opponent_id').references(() => fighterProfiles.id, { onDelete: 'set null' }),
    
    knockdowns: t.smallint('knockdowns'),
    sigStrikesLanded: t.smallint('sig_strikes_landed'),
    sigStrikesAttempted: t.smallint('sig_strikes_attempted'),
    totalStrikesLanded: t.smallint('total_strikes_landed'),
    totalStrikesAttempted: t.smallint('total_strikes_attempted'),
    
    sigHeadLanded: t.smallint('sig_head_landed'),
    sigBodyLanded: t.smallint('sig_body_landed'),
    sigLegLanded: t.smallint('sig_leg_landed'),
    sigHeadAttempted: t.smallint('sig_head_attempted'),
    sigBodyAttempted: t.smallint('sig_body_attempted'),
    sigLegAttempted: t.smallint('sig_leg_attempted'),
    
    takedownsLanded: t.smallint('takedowns_landed'),
    takedownsAttempted: t.smallint('takedowns_attempted'),
    
    reversals: t.smallint('reversals'),
    submissionAttempts: t.smallint('submission_attempts'),
    advances: t.smallint('advances'),
    
    controlTimeSeconds: t.smallint('control_time_seconds'),
    standups: t.smallint('standups'),
    
    knockdownsAbsorbed: t.smallint('knockdowns_absorbed'),
    sigStrikesAbsorbed: t.smallint('sig_strikes_absorbed'),
    takedownsConceded: t.smallint('takedowns_conceded'),
    controlTimeAgainstSeconds: t.smallint('control_time_against_seconds'),
    
    roundEndedInDominantPosition: t.boolean('round_ended_in_dominant_position'),
    
    fenceClincTimeSeconds: t.smallint('fence_clinch_time_seconds'),
    groundTimeSeconds: t.smallint('ground_time_seconds'),
  }), (table) => [
    index('round_stats_idx').on(table.fightId, table.roundNumber, table.fighterId),
  ]);