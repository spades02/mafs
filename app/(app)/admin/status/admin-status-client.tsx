"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  generatedAt: string;
  nextEvent: { eventId: string; name: string; dateTime: string } | null;
  currentRun: {
    id: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    tickCount: number;
    totalFightsSimulated: number;
    targetSims: number;
    totalCostUsd: number;
  } | null;
  recalibration: {
    latest: {
      version: number;
      isActive: boolean;
      computedAt: string;
      sampleSize: number | null;
      calibrationScore: number | null;
    } | null;
    recent: Array<{
      version: number;
      isActive: boolean;
      computedAt: string;
      sampleSize: number | null;
      calibrationScore: number | null;
    }>;
    graded: {
      total: number;
      actionable: number;
      minSampleNeeded: number;
      canRecalibrateNow: boolean;
    };
  };
  perFight: Array<{
    fightId: string;
    fighterA: string | null;
    fighterB: string | null;
    weightClass: string | null;
    labelCount: number;
    totalTicks: number;
    labels: Array<{
      betType: string;
      label: string;
      ticks: number;
      modelProb: { min: number; max: number; avg: number; median: number; latest: number };
      edge: { avg: number | null; median: number | null; latest: number | null };
      latestMarketOdd: number | null;
    }>;
  }>;
};

function fmtPct(v: number | null | undefined, digits = 1): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${(v * 100).toFixed(digits)}%`;
}

// edge_pct is stored already as a percentage (31.5 = 31.5%), not a fraction.
function fmtEdge(v: number | null | undefined, digits = 1): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(digits)}%`;
}

function fmtOdds(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return v > 0 ? `+${v}` : String(v);
}

function fmtRelative(iso: string | null): string {
  if (!iso) return "—";
  const ts = new Date(iso).getTime();
  const diff = Date.now() - ts;
  if (Number.isNaN(diff)) return iso;
  const abs = Math.abs(diff);
  const min = Math.round(abs / 60_000);
  const hr = Math.round(abs / 3_600_000);
  const day = Math.round(abs / 86_400_000);
  if (abs < 60_000) return diff >= 0 ? "just now" : "in <1 min";
  const suffix = diff >= 0 ? "ago" : "from now";
  if (min < 60) return `${min} min ${suffix}`;
  if (hr < 36) return `${hr} hr ${suffix}`;
  return `${day} day ${suffix}`;
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusTone(s: string): { dot: string; chip: string; label: string } {
  switch (s) {
    case "running":
      return {
        dot: "bg-emerald-400 animate-pulse",
        chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        label: "Running",
      };
    case "completed":
      return {
        dot: "bg-sky-400",
        chip: "border-sky-500/30 bg-sky-500/10 text-sky-300",
        label: "Completed",
      };
    case "failed":
      return {
        dot: "bg-rose-400",
        chip: "border-rose-500/30 bg-rose-500/10 text-rose-300",
        label: "Failed",
      };
    case "pending":
      return {
        dot: "bg-amber-400",
        chip: "border-amber-500/30 bg-amber-500/10 text-amber-300",
        label: "Pending",
      };
    default:
      return {
        dot: "bg-muted-foreground",
        chip: "border-border/40 bg-muted/20 text-muted-foreground",
        label: s,
      };
  }
}

// edge values are percentages (5 = 5%, 12 = 12%), not fractions.
function edgeTone(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "text-muted-foreground";
  if (v >= 10) return "text-emerald-300 font-semibold";
  if (v >= 3) return "text-emerald-400";
  if (v <= -5) return "text-rose-400";
  return "text-muted-foreground";
}

export function AdminStatusClient(props: Props) {
  const { generatedAt, nextEvent, currentRun, recalibration, perFight } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showRecent, setShowRecent] = useState(false);
  const [, force] = useState(0);

  // Keep relative timestamps fresh.
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const progressPct = useMemo(() => {
    if (!currentRun || currentRun.targetSims <= 0) return 0;
    return Math.min(100, Math.round((currentRun.totalFightsSimulated / currentRun.targetSims) * 100));
  }, [currentRun]);

  const runTone = currentRun ? statusTone(currentRun.status) : null;

  return (
    <main className="px-4 sm:px-6 lg:px-8 pt-10 pb-32 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.25em] text-emerald-400 font-semibold">
              Live Pipeline
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white mb-1">
            Multi-Agent Simulation Pipeline
          </h1>
          <p className="text-sm text-muted-foreground">
            Refreshed {fmtRelative(generatedAt)}
            {nextEvent ? ` · Building portfolio for ${nextEvent.name}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/gameplan?preview=1"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.04] px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Preview Gameplan
          </Link>
          <button
            type="button"
            onClick={() => startTransition(() => router.refresh())}
            disabled={isPending}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-border/40 bg-[#0F1420]/80 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-white hover:border-border transition",
              isPending && "opacity-60",
            )}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isPending && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Pipeline status card */}
      <section className="mb-8 rounded-2xl border border-border/40 bg-[#0F1420]/70 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm uppercase tracking-[0.25em] text-muted-foreground font-semibold">
              Weekly Simulation Run
            </h2>
          </div>
          {runTone && (
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest",
                runTone.chip,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", runTone.dot)} />
              {runTone.label}
            </span>
          )}
        </div>

        {!currentRun ? (
          <p className="text-sm text-muted-foreground">
            No active run for the upcoming event yet. The next cron tick will create one.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <Stat label="Tick #" value={currentRun.tickCount.toString()} />
              <Stat
                label="Simulations"
                value={currentRun.totalFightsSimulated.toLocaleString()}
                hint={`of ${currentRun.targetSims.toLocaleString()} target`}
              />
              <Stat label="Progress" value={`${progressPct}%`} />
              <Stat
                label="Started"
                value={fmtRelative(currentRun.startedAt)}
                hint={fmtDateTime(currentRun.startedAt)}
              />
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
                <span>Toward Weekly Target</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {nextEvent && (
              <div className="mt-5 pt-5 border-t border-border/30 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Event window opens {fmtRelative(nextEvent.dateTime)}
                </span>
                <span className="text-muted-foreground/70">
                  {fmtDateTime(nextEvent.dateTime)}
                </span>
              </div>
            )}
          </>
        )}
      </section>

      {/* Self-improvement loop card */}
      <section className="mb-8 rounded-2xl border border-border/40 bg-[#0F1420]/70 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm uppercase tracking-[0.25em] text-muted-foreground font-semibold">
              Self-Improvement Loop
            </h2>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest",
              recalibration.graded.canRecalibrateNow
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300",
            )}
          >
            {recalibration.graded.canRecalibrateNow ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {recalibration.graded.canRecalibrateNow ? "Ready" : "Collecting Samples"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <Stat
            label="Active Version"
            value={recalibration.latest ? `v${recalibration.latest.version}` : "—"}
            hint={
              recalibration.latest
                ? `Trained ${fmtRelative(recalibration.latest.computedAt)}`
                : "Awaiting first recalibration"
            }
          />
          <Stat
            label="Training Samples"
            value={recalibration.graded.actionable.toLocaleString()}
            hint={`of ${recalibration.graded.minSampleNeeded} needed`}
          />
          <Stat
            label="Last Score"
            value={
              recalibration.latest?.calibrationScore !== null &&
              recalibration.latest?.calibrationScore !== undefined
                ? recalibration.latest.calibrationScore.toFixed(3)
                : "—"
            }
            hint="Lower = better calibrated"
          />
        </div>

        {/* Sample-readiness bar */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
            <span>Toward Next Recalibration</span>
            <span>
              {recalibration.graded.actionable.toLocaleString()} /{" "}
              {recalibration.graded.minSampleNeeded}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-700",
                recalibration.graded.canRecalibrateNow
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-300"
                  : "bg-gradient-to-r from-amber-500 to-amber-300",
              )}
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    (recalibration.graded.actionable / recalibration.graded.minSampleNeeded) * 100,
                  ),
                )}%`,
              }}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground/80 leading-relaxed mb-4">
          Each Sunday, the system reviews how its prior predictions held up and adjusts its
          confidence model. The current version stays active until enough graded outcomes
          ({recalibration.graded.minSampleNeeded}+) have been collected to safely train a new one.
        </p>

        {recalibration.recent.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setShowRecent((v) => !v)}
              className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-white transition"
            >
              {showRecent ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              Version History
            </button>
            {showRecent && (
              <div className="mt-3 space-y-1.5">
                {recalibration.recent.map((c) => (
                  <div
                    key={c.version}
                    className="flex items-center justify-between text-xs text-muted-foreground py-1.5 px-3 rounded-md bg-muted/10"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-mono",
                          c.isActive ? "text-emerald-300 font-semibold" : "text-foreground",
                        )}
                      >
                        v{c.version}
                      </span>
                      {c.isActive && (
                        <span className="text-[9px] uppercase tracking-widest text-emerald-400">
                          Active
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-4 text-muted-foreground/70">
                      <span>{c.sampleSize?.toLocaleString() ?? "—"} samples</span>
                      <span>
                        {c.calibrationScore !== null && c.calibrationScore !== undefined
                          ? c.calibrationScore.toFixed(3)
                          : "—"}
                      </span>
                      <span>{fmtRelative(c.computedAt)}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Per-fight breakdown */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm uppercase tracking-[0.25em] text-muted-foreground font-semibold">
              Per-Fight Breakdown
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {perFight.length} {perFight.length === 1 ? "fight" : "fights"} · sorted by strongest edge
          </span>
        </div>

        {perFight.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-[#0F1420]/70 p-8 text-center text-sm text-muted-foreground">
            No simulation results yet for this run. Check back after the next cron tick.
          </div>
        ) : (
          <div className="space-y-4">
            {perFight.map((fight, idx) => (
              <FightCard key={fight.fightId} fight={fight} defaultOpen={idx === 0} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-1.5">
        {label}
      </div>
      <div className="text-2xl font-light text-white tabular-nums">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground/70 mt-1">{hint}</div>}
    </div>
  );
}

function FightCard({
  fight,
  defaultOpen,
}: {
  fight: Props["perFight"][number];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bestLabel = fight.labels[0];
  const bestEdge = bestLabel?.edge.latest;

  return (
    <div className="rounded-2xl border border-border/40 bg-[#0F1420]/70 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-muted/5 transition"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-medium text-white truncate">
              {fight.fighterA ?? "Fighter A"}{" "}
              <span className="text-muted-foreground/60">vs</span>{" "}
              {fight.fighterB ?? "Fighter B"}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground/70">
            {fight.weightClass && (
              <span className="capitalize">{fight.weightClass}</span>
            )}
            <span>{fight.labelCount} markets</span>
            <span>{fight.totalTicks.toLocaleString()} ticks</span>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {bestLabel && (
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 mb-0.5">
                Top Edge
              </div>
              <div className={cn("text-lg font-semibold tabular-nums", edgeTone(bestEdge))}>
                {fmtEdge(bestEdge)}
              </div>
            </div>
          )}
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-border/30">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
                  <th className="text-left py-3 px-5 font-normal">Market</th>
                  <th className="text-right py-3 px-2 font-normal">Model</th>
                  <th className="text-right py-3 px-2 font-normal">Range</th>
                  <th className="text-right py-3 px-2 font-normal">Edge</th>
                  <th className="text-right py-3 px-2 font-normal">Odds</th>
                  <th className="text-right py-3 px-5 font-normal">Ticks</th>
                </tr>
              </thead>
              <tbody>
                {fight.labels.map((l, i) => {
                  const trendIcon =
                    l.edge.latest !== null && l.edge.avg !== null
                      ? l.edge.latest > l.edge.avg
                        ? "up"
                        : l.edge.latest < l.edge.avg
                        ? "down"
                        : null
                      : null;
                  return (
                    <tr
                      key={`${l.betType}-${l.label}-${i}`}
                      className="border-t border-border/20 hover:bg-muted/5 transition"
                    >
                      <td className="py-3 px-5">
                        <div className="text-white truncate max-w-[260px]">{l.label}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
                          {l.betType}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right tabular-nums text-foreground">
                        {fmtPct(l.modelProb.latest)}
                      </td>
                      <td className="py-3 px-2 text-right tabular-nums text-muted-foreground/70 text-[11px]">
                        {fmtPct(l.modelProb.min, 0)}–{fmtPct(l.modelProb.max, 0)}
                      </td>
                      <td
                        className={cn(
                          "py-3 px-2 text-right tabular-nums",
                          edgeTone(l.edge.latest),
                        )}
                      >
                        <span className="inline-flex items-center gap-1 justify-end">
                          {trendIcon === "up" && (
                            <TrendingUp className="h-3 w-3 opacity-70" />
                          )}
                          {trendIcon === "down" && (
                            <TrendingDown className="h-3 w-3 opacity-70" />
                          )}
                          {fmtEdge(l.edge.latest)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right tabular-nums text-muted-foreground">
                        {fmtOdds(l.latestMarketOdd)}
                      </td>
                      <td className="py-3 px-5 text-right tabular-nums text-muted-foreground/70">
                        {l.ticks}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
