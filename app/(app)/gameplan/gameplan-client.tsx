"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Lock, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BuiltCard, CardLeg, ParlayTicket } from "@/lib/weekly-sims/build-card";
import type { RiskModel, RiskModelConfig } from "@/lib/weekly-sims/strategy";
import { isReleaseLive } from "@/lib/weekly-sims/release-window";
import { GameplanWaitingScreen } from "@/components/gameplan/waiting-screen";

type LegWithMatchup = CardLeg & { matchup?: string };
type ParlayWithMatchup = ParlayTicket & { legs: LegWithMatchup[] };
type CardWithMatchup = BuiltCard & {
  straights: LegWithMatchup[];
  parlays: ParlayWithMatchup[];
};

type ApiCard = {
  model: RiskModel;
  config: RiskModelConfig;
  card: CardWithMatchup;
};

type ApiResponse =
  | {
      event: { eventId: string; name: string; dateTime: string };
      bankrollUsd: number | null;
      cards: ApiCard[];
      edgesCount: number;
      gated?: false;
    }
  | {
      event: { eventId: string; name: string; dateTime: string };
      teaser: LegWithMatchup | null;
      gated: true;
    }
  | { error: string };

const BANKROLL_CHIPS = [500, 1000, 2500, 5000, 10000];

const TIER_BADGE: Record<string, { label: string; className: string }> = {
  elite: { label: "ELITE", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  strong: { label: "STRONG", className: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  medium: { label: "MODERATE", className: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  below: { label: "BELOW", className: "bg-muted text-muted-foreground border-border/40" },
};

function fmtAmericanOdds(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return n > 0 ? `+${n}` : `${n}`;
}

function StraightLeg({ leg, showDollar }: { leg: LegWithMatchup; showDollar: boolean }) {
  const tier = TIER_BADGE[leg.tier];
  return (
    <div className="rounded-xl border border-border/40 bg-[#0F1420]/70 p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">STRAIGHT</span>
            <span className={cn("text-[10px] font-bold uppercase tracking-widest border rounded px-1.5 py-0.5", tier.className)}>
              {tier.label}
            </span>
          </div>
          <p className="text-sm font-semibold text-white truncate">{leg.label}</p>
          {leg.matchup && (
            <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">{leg.matchup}</p>
          )}
          <p className="text-xs text-muted-foreground/60 mt-2">{leg.rationale}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-emerald-400">{Math.round(leg.modelProb * 100)}%</p>
          <p className="text-xs text-muted-foreground">model prob</p>
          {showDollar && leg.stakeUsd != null ? (
            <p className="text-sm font-semibold text-white mt-1">${leg.stakeUsd}</p>
          ) : (
            <p className="text-sm font-semibold text-white mt-1">{leg.units}u</p>
          )}
          <p className={cn("text-xs mt-0.5", leg.evPct >= 0 ? "text-emerald-400" : "text-rose-400")}>
            {leg.evPct >= 0 ? "+" : ""}
            {leg.evPct}% EV
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground/60">
        <span>{Math.round(leg.appearancePct * 100)}% appearance</span>
        <span>{fmtAmericanOdds(leg.americanOdds)}</span>
      </div>
    </div>
  );
}

function ParlayCard({ parlay, showDollar }: { parlay: ParlayWithMatchup; showDollar: boolean }) {
  const legCount = parlay.legs.length;
  return (
    <div className="rounded-xl border border-border/40 bg-[#0F1420]/70 p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{legCount}-LEG</span>
          <span className="text-[10px] font-bold uppercase tracking-widest border rounded px-1.5 py-0.5 bg-primary/10 text-primary border-primary/30">
            PARLAY
          </span>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-400">{Math.round(parlay.combinedProb * 100)}%</p>
          {showDollar && parlay.stakeUsd != null ? (
            <p className="text-sm font-semibold text-white">${parlay.stakeUsd} → ${parlay.payoutUsd}</p>
          ) : (
            <p className="text-sm font-semibold text-white">@ {parlay.combinedDecimalOdds.toFixed(2)}</p>
          )}
          <p className={cn("text-xs", parlay.evPct >= 0 ? "text-emerald-400" : "text-rose-400")}>
            {parlay.evPct >= 0 ? "+" : ""}
            {parlay.evPct}% EV
          </p>
        </div>
      </div>
      <div className="space-y-1.5">
        {parlay.legs.map((leg) => (
          <div key={leg.edgeId} className="flex items-center justify-between text-xs border-l-2 border-primary/40 pl-2">
            <span className="text-white truncate">{leg.label}</span>
            <span className="text-muted-foreground shrink-0 ml-2">{fmtAmericanOdds(leg.americanOdds)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GameplanClient({
  isAuthenticated,
  isPro,
  isElite,
  tier,
}: {
  isAuthenticated: boolean;
  isPro: boolean;
  isElite: boolean;
  tier: string;
}) {
  void isElite;
  void tier;
  const [bankroll, setBankroll] = useState<number | null>(1000);
  const [activeModel, setActiveModel] = useState<RiskModel>("balanced");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  // Release-window gating. Pre-Friday-6pm-ET: show waiting screen with intel
  // feed + countdown. User can hit "Preview Ready State" to bypass.
  const [previewMode, setPreviewMode] = useState(false);
  const [showWaiting, setShowWaiting] = useState(true);

  useEffect(() => {
    setShowWaiting(!isReleaseLive());
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams();
    if (bankroll != null) params.set("bankroll", String(bankroll));
    fetch(`/api/gameplan?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData({ error: "Failed to load" }))
      .finally(() => setLoading(false));
  }, [isAuthenticated, bankroll]);

  const activeCard = useMemo(() => {
    if (!data || "error" in data || data.gated) return null;
    return data.cards.find((c) => c.model === activeModel);
  }, [data, activeModel]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-md w-full bg-[#0f1419]/80 border-primary/20">
          <CardContent className="p-8 text-center">
            <Lock className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold mb-2">Sign in to view Gameplan</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Your AI-built betting card for the next event is one click away.
            </p>
            <Button asChild className="w-full"><Link href="/auth/login">Sign in</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show the waiting screen until Friday release. The user can hit
  // "Preview Ready State" to bypass and see the in-progress card anyway.
  if (showWaiting && !previewMode) {
    return <GameplanWaitingScreen onPreview={() => setPreviewMode(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || "error" in data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-muted-foreground mb-4">{data && "error" in data ? data.error : "No data."}</p>
          <Button asChild variant="outline"><Link href="/dashboard">Back to dashboard</Link></Button>
        </div>
      </div>
    );
  }

  // Free user — teaser only, with upgrade CTA.
  if (data.gated) {
    return (
      <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Your Gameplan</h1>
        <p className="text-sm text-muted-foreground mb-8">
          {data.event.name} — preview pick. Upgrade to unlock the full card.
        </p>
        {data.teaser ? (
          <StraightLeg leg={data.teaser} showDollar={false} />
        ) : (
          <p className="text-muted-foreground">No edges yet — check back closer to fight night.</p>
        )}
        <div className="mt-8 text-center">
          <Button asChild className="px-8"><Link href="/billing?plan=elite">Activate AI Gameplan ($99/mo)</Link></Button>
        </div>
      </div>
    );
  }

  // Elite-tier paywall reminder for Pro users (Pro = unlimited manual sims, Elite = auto Gameplan).
  // For now we still render the cards for both Pro and Elite; tightening to Elite-only is a config flag.

  const cardConfidence = activeCard?.card.cardConfidence ?? 0;
  const totalStake = activeCard?.card.totalStakeUsd;
  const expectedReturn = activeCard?.card.expectedReturnUsd;
  const expectedReturnPct =
    activeCard?.card.totalStakeFraction && expectedReturn != null && totalStake != null && totalStake > 0
      ? (expectedReturn / totalStake) * 100
      : null;

  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      {/* Preview banner — shown when user bypassed the waiting screen */}
      {previewMode && showWaiting && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <p className="text-xs text-emerald-300/90">
            Preview mode — final portfolio releases Friday after 1,000 sims complete.
          </p>
          <button
            onClick={() => setPreviewMode(false)}
            className="text-[11px] uppercase tracking-widest text-emerald-300 hover:text-emerald-200"
          >
            Back to live build
          </button>
        </div>
      )}
      {/* Header — "Your Gameplan Is Ready" */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
            <span>·</span>
            <span>{data.event.name}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Your Gameplan Is Ready</h1>
          <div className="flex items-center gap-3 mt-3 text-sm">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold">
              <TrendingUp className="h-3 w-3" />
              {expectedReturnPct != null ? `${expectedReturnPct >= 0 ? "+" : ""}${expectedReturnPct.toFixed(1)}%` : "—"}
            </span>
            <span className="text-muted-foreground">{Math.round((activeCard?.config.targetWinRate?.[0] ?? 0) * 100)}–{Math.round((activeCard?.config.targetWinRate?.[1] ?? 0) * 100)}% target win rate</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{(activeCard?.card.straights.length ?? 0) + (activeCard?.card.parlays.length ?? 0)} picks</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Strategy Confidence</p>
          <p className="text-5xl font-bold text-primary">{cardConfidence}%</p>
        </div>
      </div>

      {/* Strategy tabs (Safe / Balanced / High Upside / Pro) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {data.cards.map((c) => (
          <button
            key={c.model}
            onClick={() => setActiveModel(c.model)}
            className={cn(
              "text-left rounded-xl border p-4 transition-colors",
              c.model === activeModel
                ? "border-primary/60 bg-primary/10"
                : "border-border/40 bg-[#0f1419]/40 hover:border-border/70",
            )}
          >
            <p className="text-sm font-semibold text-white">{c.config.label}</p>
            <p className={cn(
              "text-xs mt-1",
              c.model === activeModel ? "text-primary" : "text-muted-foreground",
            )}>
              +{Math.round(c.config.targetMonthlyRoi[0] * 100)}–{Math.round(c.config.targetMonthlyRoi[1] * 100)}% monthly
            </p>
            {c.model === activeModel && (
              <span className="inline-block w-2 h-2 rounded-full bg-primary mt-2" />
            )}
          </button>
        ))}
      </div>

      {/* Bankroll chips */}
      <div className="flex items-center gap-3 mb-8 p-4 rounded-xl border border-border/40 bg-[#0f1419]/40">
        <Wallet className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-2">Total bankroll</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl font-bold text-white mr-2">${bankroll?.toLocaleString() ?? "—"}</span>
            {BANKROLL_CHIPS.map((amt) => (
              <button
                key={amt}
                onClick={() => setBankroll(amt)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold border transition-colors",
                  bankroll === amt
                    ? "border-primary bg-primary text-black"
                    : "border-border/50 text-muted-foreground hover:border-primary/40",
                )}
              >
                ${amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Gameplan card list */}
      <div className="rounded-xl border border-border/40 bg-[#0f1419]/40 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">● AI Gameplan</p>
            <p className="text-xs text-muted-foreground">
              {activeCard?.card.straights.length ?? 0} straights · {activeCard?.card.parlays.length ?? 0} parlays · {Math.round((activeCard?.card.totalStakeFraction ?? 0) * 100)}% exposure
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Stake</p>
            <p className="text-lg font-bold text-white">${totalStake?.toLocaleString() ?? "—"}</p>
          </div>
        </div>

        <div className="space-y-3">
          {activeCard?.card.straights.length === 0 && activeCard?.card.parlays.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
              <p>No qualifying edges yet for this strategy.</p>
              <p className="text-xs mt-1">More simulations are running through fight night.</p>
            </div>
          )}
          {activeCard?.card.straights.map((leg) => (
            <StraightLeg key={leg.edgeId} leg={leg} showDollar={bankroll != null} />
          ))}
          {activeCard?.card.parlays.map((p) => (
            <ParlayCard key={p.id} parlay={p} showDollar={bankroll != null} />
          ))}
        </div>

        {!isPro && (
          <div className="mt-6 p-4 rounded-lg border border-primary/30 bg-primary/5 text-center">
            <p className="text-sm text-white mb-2">Upgrade to lock in this Gameplan and get push alerts.</p>
            <Button asChild className="px-6"><Link href="/billing?plan=elite">Upgrade to Elite — $99/mo</Link></Button>
          </div>
        )}
      </div>
    </div>
  );
}
