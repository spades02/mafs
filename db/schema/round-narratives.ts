import { index, pgTable } from "drizzle-orm/pg-core";
import { fights } from "./fights";
import { fighterProfiles } from "./fighter-profiles";

// 4️⃣ Round Narratives
export const roundNarratives = pgTable('round_narratives', (t) => ({
    id: t.uuid('id').primaryKey().defaultRandom(),
    
    fightId: t.uuid('fight_id').notNull().references(() => fights.id, { onDelete: 'cascade' }),
    roundNumber: t.smallint('round_number').notNull(),
    
    roundWinnerFighterId: t.uuid('round_winner_fighter_id').references(() => fighterProfiles.id, { onDelete: 'set null' }),
    roundWinType: t.text('round_win_type', { enum: ['clear', 'competitive', 'swing'] }),
    
    whyWinnerSummary: t.text('why_winner_summary'),
    
    keyDamageMoments: t.jsonb('key_damage_moments'),
    momentumShifts: t.jsonb('momentum_shifts'),
    
    cardioShiftA: t.text('cardio_shift_a', { enum: ['improved', 'stable', 'declining', 'unknown'] }),
    cardioShiftB: t.text('cardio_shift_b', { enum: ['improved', 'stable', 'declining', 'unknown'] }),
    
    nearlyFinishedA: t.boolean('nearly_finished_a'),
    nearlyFinishedB: t.boolean('nearly_finished_b'),
    
    reactionsToAdversityA: t.text('reactions_to_adversity_a'),
    reactionsToAdversityB: t.text('reactions_to_adversity_b'),
    
    styleTransitionsA: t.jsonb('style_transitions_a'),
    styleTransitionsB: t.jsonb('style_transitions_b'),
    
    smartDecisionsA: t.jsonb('smart_decisions_a'),
    smartDecisionsB: t.jsonb('smart_decisions_b'),
    
    badDecisionsA: t.jsonb('bad_decisions_a'),
    badDecisionsB: t.jsonb('bad_decisions_b'),
    
    coachInstructionsBetweenRounds: t.text('coach_instructions_between_rounds'),
    
    coachInstructionsFollowThroughA: t.text('coach_instructions_follow_through_a', { enum: ['followed', 'partially_followed', 'ignored', 'unknown'] }),
    coachInstructionsFollowThroughB: t.text('coach_instructions_follow_through_b', { enum: ['followed', 'partially_followed', 'ignored', 'unknown'] }),
    
    crowdEffect: t.text('crowd_effect'),
    
    bodyLanguageConfidenceA: t.text('body_language_confidence_a'),
    bodyLanguageConfidenceB: t.text('body_language_confidence_b'),
    
    slowingDownA: t.boolean('slowing_down_a'),
    slowingDownB: t.boolean('slowing_down_b'),
    speedingUpA: t.boolean('speeding_up_a'),
    speedingUpB: t.boolean('speeding_up_b'),
    
    narrativeSummary: t.text('narrative_summary'),
    
    annotatorId: t.uuid('annotator_id'),
    version: t.text('version'),
  }), (table) => [
    index('round_narratives_idx').on(table.fightId, table.roundNumber),
  ]);