CREATE TABLE IF NOT EXISTS "saved_plays" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bet_id" text NOT NULL,
	"event_id" text,
	"event_name" text,
	"fight" text,
	"label" text NOT NULL,
	"bet_type" text NOT NULL,
	"odds_american" text,
	"p_sim" double precision,
	"p_imp" double precision,
	"edge_pct" double precision,
	"confidence_pct" double precision,
	"saved_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "saved_plays" ADD CONSTRAINT "saved_plays_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "saved_plays_user_bet_uq" ON "saved_plays" USING btree ("user_id","bet_id");
