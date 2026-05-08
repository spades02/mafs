"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Cpu, GitBranch, Radar, ShieldCheck, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { msUntilNextRelease } from "@/lib/weekly-sims/release-window";

type EvaluatingItem = {
  title: string;
  subtitle: string;
  status: "ACTIVE" | "ANALYZING" | "CONVERGING" | "OPTIMIZING" | "MONITORING";
  icon: typeof Cpu;
};

const EVALUATING: EvaluatingItem[] = [
  {
    title: "Hidden Value Opportunities",
    subtitle: "Detecting mispriced outcomes across market segments",
    status: "ACTIVE",
    icon: Radar,
  },
  {
    title: "Correlated Outcome Structures",
    subtitle: "Identifying connected parlays with positive expectation",
    status: "ANALYZING",
    icon: GitBranch,
  },
  {
    title: "Public Bias Distortions",
    subtitle: "Exploiting recreational money imbalances",
    status: "CONVERGING",
    icon: TrendingUp,
  },
  {
    title: "Volatility Resistant Positions",
    subtitle: "Building stable portfolio structures",
    status: "OPTIMIZING",
    icon: ShieldCheck,
  },
  {
    title: "Market Overreaction Signals",
    subtitle: "Capturing value from news-driven line moves",
    status: "MONITORING",
    icon: Activity,
  },
];

/** Realistic-looking intel ticker. Cycled in-place; not real data, intentionally flavor-only. */
const FEED_LINES: string[] = [
  "Sharp action detected on undercard props — volatility tracking",
  "Correlated finish probabilities converging across 4 fights",
  "Heavyweight ML edge stabilized at +12% across 247 simulations",
  "Round prop drift detected — re-running flyweight ITD agents",
  "Market line moved -8 on co-main; recomputing implied probability",
  "Edge stability threshold reached for top 6 picks",
  "Parlay correlation matrix updated — 3 candidate tickets",
  "Anchor-leg exposure check passed — no fight over 40%",
  "Public-money skew detected on featherweight favorite",
  "Distance prop convergence confirmed — appearance pct 0.87",
  "Kelly stake recomputed for 5 elite-tier straights",
  "Cross-fight finish-method correlation surfaced",
  "Stakes scaled to risk model — exposure within band",
];

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatStatus(s: EvaluatingItem["status"]): string {
  return s;
}

export function GameplanWaitingScreen() {
  const [remaining, setRemaining] = useState(() => msUntilNextRelease());
  const [feedIdx, setFeedIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setRemaining(msUntilNextRelease()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setFeedIdx((i) => (i + 1) % FEED_LINES.length), 2200);
    return () => clearInterval(t);
  }, []);

  const { days, hrs, min, sec } = useMemo(() => {
    const total = Math.max(0, Math.floor(remaining / 1000));
    const days = Math.floor(total / 86400);
    const hrs = Math.floor((total % 86400) / 3600);
    const min = Math.floor((total % 3600) / 60);
    const sec = total % 60;
    return { days, hrs, min, sec };
  }, [remaining]);

  // Render the last 3 feed lines as a stacked tail.
  const tail = useMemo(() => {
    const out: string[] = [];
    for (let k = 2; k >= 0; k--) {
      out.push(FEED_LINES[(feedIdx - k + FEED_LINES.length) % FEED_LINES.length]);
    }
    return out;
  }, [feedIdx]);

  return (
    <div className="min-h-screen px-4 pt-12 pb-32 max-w-3xl mx-auto text-center">
      {/* SYSTEM ACTIVE pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 mb-12">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] uppercase tracking-[0.25em] text-emerald-400 font-semibold">
          System Active
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-5xl md:text-6xl font-light tracking-tight text-white mb-2">
        Friday Gameplan
      </h1>
      <h2 className="text-5xl md:text-6xl font-light tracking-tight leading-[1.15] pb-2 bg-gradient-to-b from-emerald-300 to-emerald-500/70 bg-clip-text text-transparent mb-8">
        In Progress
      </h2>

      <p className="text-base text-muted-foreground max-w-md mx-auto mb-16 leading-relaxed">
        Multi-agent simulation in progress. Constructing this week's
        highest-conviction edge portfolio.
      </p>

      {/* Countdown */}
      <div className="mb-16">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70 mb-6">
          Portfolio Release Countdown
        </p>
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
          {[
            { label: "Days", value: days },
            { label: "Hrs", value: hrs },
            { label: "Min", value: min },
            { label: "Sec", value: sec },
          ].map((u) => (
            <div key={u.label} className="flex flex-col items-center">
              <div className="text-5xl md:text-6xl font-light text-white tabular-nums">
                {pad(u.value)}
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 mt-2">
                {u.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Intelligence Feed */}
      <div className="mb-12 text-left max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400/90 font-semibold">
            Live Intelligence Feed
          </span>
        </div>

        <div className="space-y-1.5 mb-8">
          {tail.map((line, i) => (
            <p
              key={`${line}-${i}`}
              className={cn(
                "text-xs leading-5 transition-opacity duration-700",
                i === tail.length - 1
                  ? "text-emerald-300/90"
                  : "text-muted-foreground opacity-60",
              )}
            >
              <span className="text-emerald-400/70 mr-2">›</span>
              {line}
            </p>
          ))}
        </div>

        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70 mb-3">
          Currently Evaluating
        </p>
        <div className="space-y-2">
          {EVALUATING.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-lg border border-border/40 bg-[#0F1420]/70 p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">
                  <Icon className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground/70 truncate">
                    {item.subtitle}
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300/90 border border-emerald-500/30 bg-emerald-500/10 rounded px-2 py-1 shrink-0">
                  {formatStatus(item.status)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-4">
        Optimizing retained EV structure
      </p>
    </div>
  );
}
