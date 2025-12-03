import { pgTable } from 'drizzle-orm/pg-core';
import { fighterProfiles } from './fighter-profiles';

// 2️⃣ Fights
export const fights = pgTable('fights', (t) => ({
    id: t.uuid('id').primaryKey().defaultRandom(),
    
    createdAt: t.timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: t.timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    
    eventId: t.uuid('event_id'),
    eventName: t.text('event_name'),
    promotion: t.text('promotion'),
    
    eventDate: t.date('event_date'),
    venueCity: t.text('venue_city'),
    venueCountry: t.text('venue_country'),
    
    cageSizeM: t.numeric('cage_size_m'),
    altitudeM: t.numeric('altitude_m'),
    
    cardOrder: t.smallint('card_order'),
    
    weightClass: t.text('weight_class'),
    fightType: t.text('fight_type'),
    
    fighterAId: t.uuid('fighter_a_id').notNull().references(() => fighterProfiles.id, { onDelete: 'restrict' }),
    fighterBId: t.uuid('fighter_b_id').notNull().references(() => fighterProfiles.id, { onDelete: 'restrict' }),
    
    isRematch: t.boolean('is_rematch'),
    rematchNumber: t.smallint('rematch_number'),
    
    isShortNoticeA: t.boolean('is_short_notice_a'),
    isShortNoticeB: t.boolean('is_short_notice_b'),
    shortNoticeDaysA: t.smallint('short_notice_days_a'),
    shortNoticeDaysB: t.smallint('short_notice_days_b'),
    
    refereeName: t.text('referee_name'),
    judgeNames: t.text('judge_names').array(),
    
    roundsScheduled: t.smallint('rounds_scheduled'),
    roundsCompleted: t.smallint('rounds_completed'),
    
    winnerFighterId: t.uuid('winner_fighter_id').references(() => fighterProfiles.id, { onDelete: 'set null' }),
    
    resultMethod: t.text('result_method', { enum: ['KO', 'TKO', 'SUB', 'DEC', 'DQ', 'NC', 'OTHER'] }),
    resultDetail: t.text('result_detail'),
    
    finishRound: t.smallint('finish_round'),
    finishTimeSeconds: t.smallint('finish_time_seconds'),
    
    isSplitOrMajorityDecision: t.boolean('is_split_or_majority_decision'),
    officialScorecards: t.jsonb('official_scorecards'),
    
    noContestReason: t.text('no_contest_reason'),
    notes: t.text('notes'),
  }));