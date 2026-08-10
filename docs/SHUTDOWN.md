# MAFS — Shutdown & Restart Runbook

Status: **shutting down** (initiated 2026-08-10)

This document covers taking MAFS fully offline while preserving all data, and
bringing it back later. It is deliberately ordered — doing these steps out of
sequence causes hung requests or lost webhook events.

---

## What was costing money

Measured at shutdown time, so future-you knows where the money actually went.

| Service | What it cost | Notes |
|---|---|---|
| Supabase | **$25/mo** (Pro plan) | Org `MAFS` (`fbxbfuzxxjjhmtbucied`) contains only the MAFS project. No client work entangled. |
| Vercel | **~$20/mo** (Pro plan) | Pro was required for sub-daily crons. With crons gone, Hobby is enough. |
| SportsData.io | subscription | Fighter stats + results. Only consumer was the data pipeline and calibration crons. |
| The Odds API | subscription | Live odds. Same. |
| OpenAI | **~$2/mo** | Already negligible: $2.16 across 25 calls in the 30 days to 2026-08-10. The weekly-sims pause (commit `2eaea61`) had already stopped the real spend. |
| Resend | likely $0 | Free tier unless volume grew. |
| RevenueCat | $0 | Free below the revenue threshold. |
| Apple Developer | **$99/yr** | Required to keep the iOS app listed at all. |
| `mafs.ai` domain | annual | Let it lapse only if abandoning the brand. |

**The headline:** the LLM was never the problem by the end. Fixed monthly
platform subscriptions were.

---

## The offline switch

`MAFS_OFFLINE=1` takes the whole product down without deleting anything.

When set, `proxy.ts` answers **every** request with a static 503 maintenance
page before touching the database, auth, or any paid API. That ordering is the
whole point: it is what makes the deployment safe to leave running while the
Supabase project is paused. If the switch ran after `getSession()`, every
request would hang on a dead database until the function timed out.

Two further guards, in case a route or script is ever invoked directly and
bypasses the proxy:

- `safeGenerateObject()` in `app/ai/agents/agents.ts` throws instead of calling
  OpenAI. Every LLM call in the codebase funnels through that one wrapper.
- `sendEmail()` in `app/lib/email.ts` logs and returns instead of calling Resend.

See `lib/shutdown.ts`.

> **The variable is read into the middleware bundle at build time.** Setting it
> in the Vercel dashboard does nothing until you redeploy.

---

## Shutdown sequence

### 1. Back up the database — do this first

```bash
node scripts/backup-db.mjs
```

Writes newline-delimited JSON per table to `../mafs-backup-<date>/`, **outside
the repo** (it contains user emails, session tokens, and OAuth account rows —
never commit it). Every table is verified against `COUNT(*)`; the script exits
non-zero and leaves `.partial` files if anything failed to verify. Re-running
resumes.

Takes ~15 min: throughput to the Supabase pooler is roughly 65 KB/s.

Together with the migrations in `drizzle/`, this dump is a complete restore
path independent of anything Supabase does to the project.

Copy the backup somewhere durable before continuing.

### 2. Stop the scheduled spend

Already done — `vercel.json` has an empty `crons` array. This stops the
calibration crons, the cost-alert cron, and the retention emails. The
weekly-simulations cron was already removed in `2eaea61`.

### 3. Take the site offline

```bash
vercel env add MAFS_OFFLINE production   # value: 1
vercel --prod                            # redeploy — required, see note above
```

Verify before moving on:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://mafs.ai/
curl -s -o /dev/null -w "%{http_code}\n" https://mafs.ai/api/agents
```

Both must return `503`. **Do not proceed to step 4 until they do** — pausing the
database while the app is still live gives users hung requests instead of a
maintenance page.

### 4. Pause Supabase

Dashboard → project `vlpjyojbujvxfsdazycc` → Settings → General → Pause project.
Data is retained.

Then, separately: **downgrade the `MAFS` org to the Free plan.** Pausing the
project alone does *not* stop the $25/mo — that is an org-level subscription and
it keeps billing until the org itself is downgraded. This is the single easiest
step to get wrong.

Keep the backup from step 1 regardless: on the Free plan, projects left paused
for an extended period are subject to removal.

### 5. Downgrade / cancel the rest

- **Vercel** — downgrade the project's team to Hobby. Crons are gone, so nothing
  needs Pro. (A static 503 page on Hobby costs nothing.)
- **SportsData.io** — cancel the subscription.
- **The Odds API** — cancel the subscription.
- **OpenAI** — set a $0 monthly budget limit, and rotate/revoke `OPENAI_API_KEY`.
  Belt and braces alongside the code guard.
- **Resend** — nothing to cancel if on free tier; the code no longer sends.
- **Apple Developer ($99/yr)** — only let this lapse if abandoning iOS. The app
  is delisted when it expires and the bundle ID becomes hard to reclaim.
- **`mafs.ai` domain** — keep it unless abandoning the brand. It is the cheapest
  thing on this list and the hardest to get back.

### 6. Subscribers — outstanding

**13 users still have `subscription_status = 'active'` on the Pro tier.** They
are currently being billed by Stripe for a product that serves them a 503.

This was consciously deferred at shutdown, not overlooked. Resolve it in Stripe:

- Set `cancel_at_period_end` on all 13 — they stop renewing, no refunds owed; or
- Cancel immediately with prorated refunds — cleaner, costs the refund amount.

Note that with the site offline, Stripe and RevenueCat webhooks receive 503 and
will retry for up to ~3 days before giving up. Subscription state changes made
during that window will **not** be written to the database. Reconcile against
Stripe as the source of truth when restarting.

---

## Restart sequence

Reverse order, roughly:

1. Resume the Supabase project (upgrade the org back to Pro first if you need
   the compute or the daily backups).
2. Confirm the database is reachable and migrations are current:
   `npx drizzle-kit migrate`.
3. Re-add any cancelled API keys: `SPORTS_DATA_API_KEY`, `ODDS_API_KEY`,
   `OPENAI_API_KEY`.
4. Remove `MAFS_OFFLINE` from the Vercel environment and **redeploy**.
5. Restore crons in `vercel.json`. The five that were removed:

   ```json
   { "path": "/api/calibration/settle",       "schedule": "0 6 * * *" }
   { "path": "/api/calibration/grade",        "schedule": "30 6 * * *" }
   { "path": "/api/calibration/recalibrate",  "schedule": "0 8 * * 0" }
   { "path": "/api/cron/cost-alert",          "schedule": "0 12 * * *" }
   { "path": "/api/cron/retention-emails",    "schedule": "0 22 * * 3" }
   ```

   Plus weekly-simulations, if you want gameplan generation back — this is the
   expensive one, and it needs the Vercel Pro plan for a sub-daily schedule:

   ```json
   { "path": "/api/cron/weekly-simulations",  "schedule": "0 */4 * * 3,4,5,6,0" }
   ```

6. Reconcile subscriptions against Stripe before re-enabling billing gates.
7. Calibration data has a gap for the shutdown window — fights that happened
   while settle/grade were not running were never settled.
   `scripts/reset-future-fight-outcomes.mjs` and the backfill helpers in
   `lib/calibration/` are the starting point.
