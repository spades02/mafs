CREATE TABLE "agent_outputs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"fight_id" uuid NOT NULL,
	"fighter_id" uuid,
	"agent_type" text,
	"signal_strength" numeric,
	"confidence" numeric,
	"numeric_features" jsonb,
	"categorical_flags" jsonb,
	"notes" text,
	"version" text,
	"raw_output" jsonb,
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"password_hash" text,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fight_markets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fight_id" uuid NOT NULL,
	"bookmaker" text,
	"market_type" text,
	"opening_odds_a" numeric,
	"opening_odds_b" numeric,
	"closing_odds_a" numeric,
	"closing_odds_b" numeric,
	"current_odds_a" numeric,
	"current_odds_b" numeric,
	"live_odds_history" jsonb,
	"line_movement_history" jsonb,
	"handle_pct_a" numeric,
	"handle_pct_b" numeric,
	"bet_count_pct_a" numeric,
	"bet_count_pct_b" numeric,
	"sharp_steam_flags" jsonb,
	"max_limit_indicator" text,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fighter_news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"fighter_id" uuid NOT NULL,
	"related_fight_id" uuid,
	"news_date" date,
	"source_name" text,
	"source_url" text,
	"source_type" text,
	"injury_notes" text,
	"injury_severity" text,
	"camp_change" boolean,
	"camp_change_details" text,
	"weight_cut_issue" boolean,
	"weight_cut_details" text,
	"short_notice_flag" boolean,
	"illness_reported" boolean,
	"illness_details" text,
	"pullouts_or_reschedules" text,
	"press_conference_quotes" text,
	"red_flag_indicators" text[],
	"sentiment_score" numeric,
	"sentiment_label" text,
	"source_credibility_score" numeric,
	"applies_to_fighter_side" text,
	"ml_features" jsonb
);
--> statement-breakpoint
CREATE TABLE "fighter_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"first_name" text,
	"last_name" text,
	"nickname" text,
	"gender" text,
	"country" text,
	"city" text,
	"date_of_birth" date,
	"height_cm" numeric,
	"reach_cm" numeric,
	"leg_reach_cm" numeric,
	"primary_weight_class" text,
	"other_weight_classes" text[],
	"stance_primary" text,
	"stance_secondary" text,
	"base_style" text,
	"secondary_styles" text[],
	"camp_name" text,
	"camp_country" text,
	"coach_notables" text,
	"pro_debut_date" date,
	"mma_record_wins" smallint,
	"mma_record_losses" smallint,
	"mma_record_draws" smallint,
	"mma_record_ncs" smallint,
	"ufc_wins" smallint,
	"ufc_losses" smallint,
	"finish_rate_win_pct" numeric,
	"finish_rate_loss_pct" numeric,
	"title_fights" smallint,
	"cardio_rating" smallint,
	"power_rating" smallint,
	"durability_rating" smallint,
	"fight_iq_rating" smallint,
	"wrestling_rating" smallint,
	"bjj_rating" smallint,
	"clinch_rating" smallint,
	"pace_pressure_rating" smallint,
	"defense_striking_rating" smallint,
	"defense_grappling_rating" smallint,
	"momentum_last5_results" jsonb,
	"momentum_win_streak" smallint,
	"momentum_loss_streak" smallint,
	"recent_weight_class_trend" text,
	"durability_ko_losses_last5" smallint,
	"durability_body_damage_trend" text,
	"age_curve_status" text,
	"performance_by_age_buckets" jsonb,
	"vulnerability_vs_styles" jsonb,
	"strength_vs_styles" jsonb,
	"early_round_finisher" boolean,
	"late_round_comeback" boolean,
	"notable_x_factors" text
);
--> statement-breakpoint
CREATE TABLE "fights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_id" uuid,
	"event_name" text,
	"promotion" text,
	"event_date" date,
	"venue_city" text,
	"venue_country" text,
	"cage_size_m" numeric,
	"altitude_m" numeric,
	"card_order" smallint,
	"weight_class" text,
	"fight_type" text,
	"fighter_a_id" uuid NOT NULL,
	"fighter_b_id" uuid NOT NULL,
	"is_rematch" boolean,
	"rematch_number" smallint,
	"is_short_notice_a" boolean,
	"is_short_notice_b" boolean,
	"short_notice_days_a" smallint,
	"short_notice_days_b" smallint,
	"referee_name" text,
	"judge_names" text[],
	"rounds_scheduled" smallint,
	"rounds_completed" smallint,
	"winner_fighter_id" uuid,
	"result_method" text,
	"result_detail" text,
	"finish_round" smallint,
	"finish_time_seconds" smallint,
	"is_split_or_majority_decision" boolean,
	"official_scorecards" jsonb,
	"no_contest_reason" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "final_predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"fight_id" uuid NOT NULL,
	"model_version" text,
	"predicted_winner_fighter_id" uuid,
	"confidence_pct" numeric,
	"prob_win_a" numeric,
	"prob_win_b" numeric,
	"prob_draw" numeric,
	"ko_prob_a" numeric,
	"sub_prob_a" numeric,
	"dec_prob_a" numeric,
	"ko_prob_b" numeric,
	"sub_prob_b" numeric,
	"dec_prob_b" numeric,
	"risk_score" numeric,
	"expected_value_main_market" numeric,
	"recommended_bet_side" text,
	"recommended_bet_size_units" numeric,
	"betting_edges" jsonb,
	"red_flags" jsonb,
	"model_explanation" text,
	"feature_importance" jsonb,
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE "round_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fight_id" uuid NOT NULL,
	"round_number" smallint NOT NULL,
	"fighter_id" uuid NOT NULL,
	"opponent_id" uuid,
	"knockdowns" smallint,
	"sig_strikes_landed" smallint,
	"sig_strikes_attempted" smallint,
	"total_strikes_landed" smallint,
	"total_strikes_attempted" smallint,
	"sig_head_landed" smallint,
	"sig_body_landed" smallint,
	"sig_leg_landed" smallint,
	"sig_head_attempted" smallint,
	"sig_body_attempted" smallint,
	"sig_leg_attempted" smallint,
	"takedowns_landed" smallint,
	"takedowns_attempted" smallint,
	"reversals" smallint,
	"submission_attempts" smallint,
	"advances" smallint,
	"control_time_seconds" smallint,
	"standups" smallint,
	"knockdowns_absorbed" smallint,
	"sig_strikes_absorbed" smallint,
	"takedowns_conceded" smallint,
	"control_time_against_seconds" smallint,
	"round_ended_in_dominant_position" boolean,
	"fence_clinch_time_seconds" smallint,
	"ground_time_seconds" smallint
);
--> statement-breakpoint
CREATE TABLE "round_narratives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fight_id" uuid NOT NULL,
	"round_number" smallint NOT NULL,
	"round_winner_fighter_id" uuid,
	"round_win_type" text,
	"why_winner_summary" text,
	"key_damage_moments" jsonb,
	"momentum_shifts" jsonb,
	"cardio_shift_a" text,
	"cardio_shift_b" text,
	"nearly_finished_a" boolean,
	"nearly_finished_b" boolean,
	"reactions_to_adversity_a" text,
	"reactions_to_adversity_b" text,
	"style_transitions_a" jsonb,
	"style_transitions_b" jsonb,
	"smart_decisions_a" jsonb,
	"smart_decisions_b" jsonb,
	"bad_decisions_a" jsonb,
	"bad_decisions_b" jsonb,
	"coach_instructions_between_rounds" text,
	"coach_instructions_follow_through_a" text,
	"coach_instructions_follow_through_b" text,
	"crowd_effect" text,
	"body_language_confidence_a" text,
	"body_language_confidence_b" text,
	"slowing_down_a" boolean,
	"slowing_down_b" boolean,
	"speeding_up_a" boolean,
	"speeding_up_b" boolean,
	"narrative_summary" text,
	"annotator_id" uuid,
	"version" text
);
--> statement-breakpoint
ALTER TABLE "agent_outputs" ADD CONSTRAINT "agent_outputs_fight_id_fights_id_fk" FOREIGN KEY ("fight_id") REFERENCES "public"."fights"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_outputs" ADD CONSTRAINT "agent_outputs_fighter_id_fighter_profiles_id_fk" FOREIGN KEY ("fighter_id") REFERENCES "public"."fighter_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fight_markets" ADD CONSTRAINT "fight_markets_fight_id_fights_id_fk" FOREIGN KEY ("fight_id") REFERENCES "public"."fights"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fighter_news" ADD CONSTRAINT "fighter_news_fighter_id_fighter_profiles_id_fk" FOREIGN KEY ("fighter_id") REFERENCES "public"."fighter_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fighter_news" ADD CONSTRAINT "fighter_news_related_fight_id_fights_id_fk" FOREIGN KEY ("related_fight_id") REFERENCES "public"."fights"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fights" ADD CONSTRAINT "fights_fighter_a_id_fighter_profiles_id_fk" FOREIGN KEY ("fighter_a_id") REFERENCES "public"."fighter_profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fights" ADD CONSTRAINT "fights_fighter_b_id_fighter_profiles_id_fk" FOREIGN KEY ("fighter_b_id") REFERENCES "public"."fighter_profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fights" ADD CONSTRAINT "fights_winner_fighter_id_fighter_profiles_id_fk" FOREIGN KEY ("winner_fighter_id") REFERENCES "public"."fighter_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_predictions" ADD CONSTRAINT "final_predictions_fight_id_fights_id_fk" FOREIGN KEY ("fight_id") REFERENCES "public"."fights"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "final_predictions" ADD CONSTRAINT "final_predictions_predicted_winner_fighter_id_fighter_profiles_id_fk" FOREIGN KEY ("predicted_winner_fighter_id") REFERENCES "public"."fighter_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "round_stats" ADD CONSTRAINT "round_stats_fight_id_fights_id_fk" FOREIGN KEY ("fight_id") REFERENCES "public"."fights"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "round_stats" ADD CONSTRAINT "round_stats_fighter_id_fighter_profiles_id_fk" FOREIGN KEY ("fighter_id") REFERENCES "public"."fighter_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "round_stats" ADD CONSTRAINT "round_stats_opponent_id_fighter_profiles_id_fk" FOREIGN KEY ("opponent_id") REFERENCES "public"."fighter_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "round_narratives" ADD CONSTRAINT "round_narratives_fight_id_fights_id_fk" FOREIGN KEY ("fight_id") REFERENCES "public"."fights"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "round_narratives" ADD CONSTRAINT "round_narratives_round_winner_fighter_id_fighter_profiles_id_fk" FOREIGN KEY ("round_winner_fighter_id") REFERENCES "public"."fighter_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_outputs_idx" ON "agent_outputs" USING btree ("fight_id","agent_type");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "fight_markets_idx" ON "fight_markets" USING btree ("fight_id","bookmaker");--> statement-breakpoint
CREATE INDEX "fighter_news_idx" ON "fighter_news" USING btree ("fighter_id","news_date");--> statement-breakpoint
CREATE INDEX "final_predictions_idx" ON "final_predictions" USING btree ("fight_id","created_at");--> statement-breakpoint
CREATE INDEX "round_stats_idx" ON "round_stats" USING btree ("fight_id","round_number","fighter_id");--> statement-breakpoint
CREATE INDEX "round_narratives_idx" ON "round_narratives" USING btree ("fight_id","round_number");