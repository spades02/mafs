# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MAFS (Multi Agent Fight Simulator) is a Next.js SaaS app for AI-powered MMA/UFC betting analysis. It uses multi-agent AI (GPT-4o via Vercel AI SDK) to evaluate fights across 8 betting markets, calculate edge metrics, and generate detailed breakdowns. Supports web (Stripe) and iOS (RevenueCat/Capacitor) subscriptions.

## Commands

```bash
npm run dev          # Next.js dev server on localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run migrate      # Drizzle ORM migrations
```

No test framework is configured.

## Tech Stack

- **Framework:** Next.js 16, React 19, TypeScript 5
- **Styling:** Tailwind CSS 4, Shadcn/ui (new-york style, zinc base)
- **Database:** PostgreSQL (Supabase) with Drizzle ORM
- **Auth:** Better-Auth (email/password + Google OAuth)
- **AI:** OpenAI gpt-4o via Vercel AI SDK (`generateObject`)
- **Payments:** Stripe (web), RevenueCat (iOS/Apple IAP)
- **Mobile:** Capacitor (iOS) — app ID `com.mafs.app`
- **Email:** Resend
- **State:** Zustand (analysis UI state)
- **External APIs:** SportsData (UFC events/fighters), Odds API (live odds)

## Architecture

### Routing

Next.js App Router with route groups:
- `app/(app)/` — Protected routes (dashboard, analysis, settings, billing, my-plays, history)
- `app/(guest)/` — Public routes (landing, how-it-works, pricing)
- `app/auth/` — Login, signup, forgot/reset password
- `app/api/` — API routes

**Middleware is `proxy.ts`** (not the standard `middleware.ts`). It handles auth redirects: unverified users → `/verify-email`, unauthenticated users → `/auth/login`, authenticated users away from auth pages.

### AI Agent Pipeline (`app/ai/agents/agents.ts`)

The core analysis runs two sequential AI agents per fight, batched 6 at a time:

1. **Edge Calculator** — Evaluates 8 markets (ML, ITD, GTD, DGTD, Over/Under, MOV, Round Props, Double Chance). Outputs win probability, confidence, stability score, and multi-market evaluations.
2. **Breakdown Writer** — Generates detailed fight analysis: fair odds, outcome distribution, fighter profiles, market mispricing, simulation paths.

Data flow: SportsData fighter stats → `buildMafsEventInput()` → live odds via `resolveLiveOdds()` → AI analysis → stored as JSONB in `analysisRun` table.

Output schemas are validated with Zod (`lib/agents/schemas/`).

### Database Schema (`db/schema/`)

- `user` — Extended with `isPro`, `analysisCount`, `stripeCustomerId`, `rcCustomerId`, `subscriptionStatus`, `subscriptionPlatform`
- `analysisRun` — JSONB `result` field containing `mafsCoreEngine` (edge summaries) and `fightBreakdowns`
- `fights`, `events`, `fighters` — UFC data from SportsData
- `historicalOdds` — Odds line movement tracking

### Subscription Model

- Free: 3 analyses/month (`user.analysisCount`)
- Pro: Unlimited (`user.isPro`)
- Web users go through Stripe checkout; iOS users use RevenueCat
- `subscriptionPlatform` is either `"stripe"` or `"revenuecat"`
- Webhooks at `/api/stripe/webhook` and `/api/webhooks/revenuecat`

### Key Patterns

- Path alias: `@/*` maps to project root
- `export const dynamic = 'force-dynamic'` in root layout
- Streaming analysis updates via callback to client (`use-streaming-analysis.ts` + `useAnalysisStore` Zustand store)
- Server actions in `app/lib/actions/`
- Auth helper: `app/lib/auth/require-auth.ts` for server-side route protection
- iOS detection via `useNativePlatform` hook (Capacitor bridge)
- Odds utilities in `lib/odds/utils.ts` (american ↔ decimal ↔ probability conversion)
