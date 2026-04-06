CREATE TABLE IF NOT EXISTS "mma_odds_data" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"event" text,
	"fighter" text,
	"bookmaker" text,
	"moneyline_odds" real,
	"method_ko_tko_odds" real,
	"method_submission_odds" real,
	"method_decision_odds" real,
	"inside_distance_yes_odds" real,
	"inside_distance_no_odds" real,
	"over_1_5_odds" real,
	"under_1_5_odds" real,
	"over_2_5_odds" real,
	"under_2_5_odds" real,
	"over_3_5_odds" real,
	"under_3_5_odds" real,
	"round1_finish_odds" real,
	"round2_finish_odds" real,
	"round3_finish_odds" real,
	"fighter_win_by_decision_odds" real,
	"fight_goes_to_decision_odds" real,
	"fight_not_go_to_decision_odds" real,
	"draw_odds" real
);
--> statement-breakpoint
ALTER TABLE "prediction_logs" ALTER COLUMN "analysis_run_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "prediction_logs" ADD COLUMN "source" text DEFAULT 'live' NOT NULL;