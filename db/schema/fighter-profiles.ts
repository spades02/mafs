import { pgTable } from 'drizzle-orm/pg-core';

// 1️⃣ Fighter Profiles
export const fighterProfiles = pgTable('fighter_profiles', (t) => ({
  id: t.uuid('id').primaryKey().defaultRandom(),
  
  createdAt: t.timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: t.timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  
  firstName: t.text('first_name'),
  lastName: t.text('last_name'),
  nickname: t.text('nickname'),
  
  gender: t.text('gender', { enum: ['male', 'female', 'other'] }),
  
  country: t.text('country'),
  city: t.text('city'),
  dateOfBirth: t.date('date_of_birth'),
  
  heightCm: t.numeric('height_cm'),
  reachCm: t.numeric('reach_cm'),
  legReachCm: t.numeric('leg_reach_cm'),
  
  primaryWeightClass: t.text('primary_weight_class'),
  otherWeightClasses: t.text('other_weight_classes').array(),
  
  stancePrimary: t.text('stance_primary', { enum: ['orthodox', 'southpaw', 'switch', 'bladed', 'square', 'unknown'] }),
  stanceSecondary: t.text('stance_secondary'),
  
  baseStyle: t.text('base_style'),
  secondaryStyles: t.text('secondary_styles').array(),
  
  campName: t.text('camp_name'),
  campCountry: t.text('camp_country'),
  coachNotables: t.text('coach_notables'),
  
  proDebutDate: t.date('pro_debut_date'),
  
  mmaRecordWins: t.smallint('mma_record_wins'),
  mmaRecordLosses: t.smallint('mma_record_losses'),
  mmaRecordDraws: t.smallint('mma_record_draws'),
  mmaRecordNcs: t.smallint('mma_record_ncs'),
  
  ufcWins: t.smallint('ufc_wins'),
  ufcLosses: t.smallint('ufc_losses'),
  
  finishRateWinPct: t.numeric('finish_rate_win_pct'),
  finishRateLossPct: t.numeric('finish_rate_loss_pct'),
  
  titleFights: t.smallint('title_fights'),
  
  cardioRating: t.smallint('cardio_rating'),
  powerRating: t.smallint('power_rating'),
  durabilityRating: t.smallint('durability_rating'),
  fightIqRating: t.smallint('fight_iq_rating'),
  
  wrestlingRating: t.smallint('wrestling_rating'),
  bjjRating: t.smallint('bjj_rating'),
  clinchRating: t.smallint('clinch_rating'),
  pacePressureRating: t.smallint('pace_pressure_rating'),
  defenseStrikingRating: t.smallint('defense_striking_rating'),
  defenseGrapplingRating: t.smallint('defense_grappling_rating'),
  
  momentumLast5Results: t.jsonb('momentum_last5_results'),
  momentumWinStreak: t.smallint('momentum_win_streak'),
  momentumLossStreak: t.smallint('momentum_loss_streak'),
  
  recentWeightClassTrend: t.text('recent_weight_class_trend'),
  
  durabilityKoLossesLast5: t.smallint('durability_ko_losses_last5'),
  durabilityBodyDamageTrend: t.text('durability_body_damage_trend'),
  
  ageCurveStatus: t.text('age_curve_status', { enum: ['rising', 'prime', 'declining', 'unknown'] }),
  
  performanceByAgeBuckets: t.jsonb('performance_by_age_buckets'),
  
  vulnerabilityVsStyles: t.jsonb('vulnerability_vs_styles'),
  strengthVsStyles: t.jsonb('strength_vs_styles'),
  
  earlyRoundFinisher: t.boolean('early_round_finisher'),
  lateRoundComeback: t.boolean('late_round_comeback'),
  
  notableXFactors: t.text('notable_x_factors'),
})); 
