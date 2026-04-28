"use client"
import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info, AlertTriangle, TrendingUp } from "lucide-react"
import { FightBreakdown as FightBreakdownType } from "@/app/(app)/dashboard/d-types"
import { LineMovementChart } from "./line-movement-chart"
import { oddsToProb } from "@/lib/odds/utils"

interface FightBreakdownProps {
    breakdown: FightBreakdownType
    matchup?: string
    onClose: () => void
}

export function FightBreakdown({ breakdown, matchup, onClose }: FightBreakdownProps) {
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        if (sectionRef.current) {
            setTimeout(() => {
                const elementPosition = sectionRef.current?.getBoundingClientRect().top
                const offsetPosition = elementPosition ? elementPosition + window.pageYOffset - 100 : 0
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                })
            }, 100)
        }
    }, [matchup])

    // Resolve fighter names: prefer breakdown fields, fall back to matchup string
    const resolvedF1Name = breakdown.fighter1Name || (matchup?.split(" vs ")?.[0]?.trim()) || ""
    const resolvedF2Name = breakdown.fighter2Name || (matchup?.split(" vs ")?.[1]?.trim()) || ""

    // Strip any "Fighter Name: " or "Name " prefix from a line-part so the name
    // doesn't render twice when the row template already prepends it. Handles
    // signed (+133, -138) and unsigned (133) American odds.
    const stripNamePrefix = (s: string) => {
      if (!s) return s
      // Prefer a signed match; fall back to bare digits after a colon or whitespace.
      const signed = s.match(/[+-]\d[\d.]*/)
      if (signed) return signed[0]
      // After a colon: take the trailing numeric token and prepend "+" since
      // unsigned American odds are positive by convention.
      const colon = s.match(/:\s*([\d.]+)\s*$/)
      if (colon) return `+${colon[1]}`
      // Last-ditch: trailing bare number anywhere.
      const bare = s.match(/(?:^|\s)(\d[\d.]*)\s*$/)
      if (bare) return `+${bare[1]}`
      return s.trim()
    }

    // Parse "+133" / "-105" / "133" → number for edge math. After a name+colon,
    // a bare number is treated as a positive American odd by convention.
    const parseAmerican = (s: string): number | null => {
      if (!s) return null
      const signed = s.match(/[+-]\d+/)
      if (signed) {
        const n = Number(signed[0])
        return Number.isFinite(n) && n !== 0 ? n : null
      }
      const colon = s.match(/:\s*(\d+)/)
      if (colon) {
        const n = Number(colon[1])
        return Number.isFinite(n) && n !== 0 ? n : null
      }
      return null
    }

    // Convert American odds → implied probability (0-1)
    const impliedProb = (american: number): number => {
      return american > 0
        ? 100 / (american + 100)
        : Math.abs(american) / (Math.abs(american) + 100)
    }

    // Compute model bias by comparing MAFS true-line probability vs market-line
    // probability per fighter. Whichever side has the higher (mafs - market) delta
    // is the side the model is biased toward.
    const computeModelBias = (): "f1" | "f2" | null => {
      const tl = breakdown.trueLine || ""
      const ml = breakdown.marketLine || ""
      if (!tl.includes("/") || !ml.includes("/")) return null
      const [tl1Raw, tl2Raw] = tl.split(" / ").map(stripNamePrefix)
      const [ml1Raw, ml2Raw] = ml.split(" / ").map(stripNamePrefix)
      const tl1 = parseAmerican(tl1Raw)
      const tl2 = parseAmerican(tl2Raw)
      const ml1 = parseAmerican(ml1Raw)
      const ml2 = parseAmerican(ml2Raw)
      if (tl1 === null || tl2 === null || ml1 === null || ml2 === null) return null
      const edge1 = impliedProb(tl1) - impliedProb(ml1)
      const edge2 = impliedProb(tl2) - impliedProb(ml2)
      if (Math.abs(edge1 - edge2) < 0.005) return null
      return edge1 > edge2 ? "f1" : "f2"
    }
    const modelBias = computeModelBias()

    return (
        <section ref={sectionRef} className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <Card className="glass-card-intense glass-glow overflow-hidden border-white/5 bg-black/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
                    <CardTitle className="text-lg font-medium text-white tracking-wide">
                        Fight Breakdown{matchup ? ` — ${matchup}` : ""}
                    </CardTitle>
                    <button
                        onClick={onClose}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
                    >
                        Close
                    </button>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                    {/* SYSTEM SUMMARY */}
                    <div className="p-5 rounded-xl bg-emerald-500/3 border border-emerald-500/10">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                            <Info className="w-3.5 h-3.5" />
                            System Summary
                        </p>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            {(() => {
                                const f1Name = resolvedF1Name
                                const f2Name = resolvedF2Name

                                // If both names are missing, show a generic summary
                                if (!f1Name && !f2Name) {
                                    return (
                                        <span className="text-emerald-100 font-medium">
                                            {breakdown.modelLeaningOutcome
                                                ? `Model leans toward ${breakdown.modelLeaningOutcome}.`
                                                : "Model analysis complete. See detailed metrics below."}
                                        </span>
                                    )
                                }

                                // Prefer the math-derived bias (MAFS prob - market prob) over
                                // string-matching modelLeaningOutcome, so the summary stays aligned
                                // with the True Line / Market Line shown directly below it.
                                let favorsF2: boolean
                                if (modelBias === "f2") favorsF2 = true
                                else if (modelBias === "f1") favorsF2 = false
                                else {
                                  const f2LastName = f2Name.split(" ").pop()?.toLowerCase() || ""
                                  const outcome = breakdown.modelLeaningOutcome?.toLowerCase() || ""
                                  favorsF2 = !!(f2LastName && outcome.includes(f2LastName))
                                }

                                // Render only specific, non-boilerplate text. Drop the
                                // generic "X's path requires a specific strategy" fallback
                                // that was repeating identically across fights.
                                const favoredName = favorsF2 ? f2Name : f1Name
                                const favoredNotes = favorsF2 ? breakdown.fighter2Notes : breakdown.fighter1Notes
                                const otherName = favorsF2 ? f1Name : f2Name
                                const otherNotes = favorsF2 ? breakdown.fighter1Notes : breakdown.fighter2Notes
                                const cleanNotes = (s?: string) =>
                                    s ? s.replace(/\.\s*$/, "") + "." : ""
                                return (
                                    <>
                                        <span className="text-emerald-100 font-medium">
                                            Model bias favors <span className="text-emerald-400">{favoredName}</span>.
                                        </span>
                                        {favoredNotes ? <> {cleanNotes(favoredNotes)}</> : null}
                                        {otherName && otherNotes ? (
                                            <> {otherName}&apos;s path requires {cleanNotes(otherNotes.toLowerCase())}</>
                                        ) : null}
                                    </>
                                )
                            })()}
                        </p>
                    </div>

                    {/* MAIN METRICS GRID */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 px-2">
                        {/* True Line */}
                        <div className="space-y-3">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">MAFS True Line</p>
                            {(() => {
                                const tl = breakdown.trueLine || "";
                                // Check if trueLine is in odds format: contains "/" and has +/- numbers
                                const isOddsFormat = tl.includes("/") && /[+-]\d/.test(tl);
                                if (isOddsFormat) {
                                    const parts = tl.split(" / ").map(stripNamePrefix);
                                    return (
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-sm text-gray-400">{resolvedF1Name}</span>
                                                <span className="font-mono text-sm font-bold text-white">{parts[0]}</span>
                                            </div>
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-sm text-gray-400">{resolvedF2Name}</span>
                                                <span className="font-mono text-sm font-bold text-white">{parts[1] || "N/A"}</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <p className="font-mono text-sm font-bold text-white pt-1">{tl || "N/A"}</p>
                                );
                            })()}
                        </div>

                        {/* Market Line */}
                        <div className="space-y-3">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Market Line</p>
                            {(() => {
                                const ml = breakdown.marketLine || "";
                                // Check if marketLine is in odds format: contains "/" and has +/- numbers
                                const isOddsFormat = ml.includes("/") && /[+-]\d/.test(ml);
                                if (isOddsFormat) {
                                    const parts = ml.split(" / ").map(stripNamePrefix);
                                    return (
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-sm text-gray-400">{resolvedF1Name}</span>
                                                <span className="font-mono text-sm font-bold text-white">{parts[0]}</span>
                                            </div>
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-sm text-gray-400">{resolvedF2Name}</span>
                                                <span className="font-mono text-sm font-bold text-white">{parts[1] || "N/A"}</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <p className="text-sm text-gray-400 italic pt-1">{ml || "No odds available"}</p>
                                );
                            })()}
                        </div>

                        {/* Mispricing */}
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Mispricing (Prob)</p>
                            <p className={`text-2xl font-bold tracking-tight ${breakdown.mispricing?.includes("-") ? "text-emerald-400" : "text-emerald-400"}`}>
                                {breakdown.mispricing || "0%"}
                            </p>
                            <p className="text-[9px] text-muted-foreground/40 mt-0.5">Model - Market Implied</p>
                        </div>

                        {/* Expected Value */}
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">EV per Unit</p>
                            <p className={`text-2xl font-bold tracking-tight ${Number.parseFloat(breakdown.ev?.replace(/[+%]/g, "") || "0") >= 10 ? "text-neon-green glow-text" : "text-emerald-500"}`}>
                                {breakdown.ev || "0%"}
                            </p>
                            <p className="text-[9px] text-muted-foreground/40 mt-0.5">Expected return on $1</p>
                        </div>
                    </div>

                    {/* LINE MOVEMENT CHART */}
                    {(() => {
                        const validHistory = (breakdown.oddsHistory || []).filter(
                            (p) => typeof p?.oddsAmerican === "number" && !isNaN(p.oddsAmerican),
                        )
                        if (validHistory.length < 2) return null
                        const firstOdds = validHistory[0].oddsAmerican
                        const lastOdds = validHistory[validHistory.length - 1].oddsAmerican
                        // Direction by implied-probability delta (handles +/- crossings):
                        //   -150 → -170 = market backing this side (toward), delta>0
                        //   -170 → -150 = market fading (away), delta<0
                        const impliedDelta = oddsToProb(lastOdds) - oddsToProb(firstOdds)
                        const STABLE_THRESHOLD = 0.005
                        const isMovingToward = impliedDelta >  STABLE_THRESHOLD
                        const isMovingAway   = impliedDelta < -STABLE_THRESHOLD

                        // Approximate first edge calculation to match screenshot
                        const currentMispricingStr = breakdown.mispricing || "0%"
                        const currentEdgeVal = parseFloat(currentMispricingStr.replace(/[+%]/g, '')) || 0
                        const currentImpliedProb = oddsToProb(lastOdds) * 100
                        const firstImpliedProb = oddsToProb(firstOdds) * 100
                        const probDelta = currentImpliedProb - firstImpliedProb
                        const firstEdgeVal = parseFloat((currentEdgeVal + probDelta).toFixed(1))

                        return (
                            <div className="pt-2 px-2">
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-3.5 h-3.5" /> Line Movement
                                </p>
                                <div className="p-4 rounded border border-white/5 bg-black/20 flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="flex-1 max-w-[240px]">
                                        <LineMovementChart
                                            data={validHistory}
                                            color={currentEdgeVal >= 0 ? "#10b981" : "#8b5cf6"}
                                            height={40}
                                            openingOdds={firstOdds}
                                            currentOdds={lastOdds}
                                        />
                                        <p className={`text-[10px] font-medium mt-3 flex items-center gap-1 ${isMovingToward ? "text-emerald-400/80" : isMovingAway ? "text-amber-400/80" : "text-muted-foreground/50"}`}>
                                            {isMovingToward ? "Market Moving Toward Model" : isMovingAway ? "Market Moving Away" : "Market Stable"} <span className="text-[8px] uppercase font-bold tracking-widest ml-1">{isMovingToward ? "↘" : isMovingAway ? "↗" : "→"}</span>
                                        </p>
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 gap-4 text-sm font-mono">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-muted-foreground/60"><span className="text-[11px]">First Observed:</span> <span className="text-white font-medium">{firstOdds > 0 ? `+${firstOdds}` : firstOdds}</span></div>
                                            <div className="flex justify-between text-muted-foreground/60"><span className="text-[11px]">Current:</span> <span className="text-white font-bold">{lastOdds > 0 ? `+${lastOdds}` : lastOdds}</span></div>
                                        </div>
                                        <div className="space-y-1.5 border-l border-white/10 pl-4">
                                            <div className="flex justify-between text-muted-foreground/60"><span className="text-[11px]">Edge at First:</span> <span className="text-emerald-400/70">{firstEdgeVal > 0 ? "+" : ""}{firstEdgeVal}%</span></div>
                                            <div className="flex justify-between text-muted-foreground/60"><span className="text-[11px]">Edge Now:</span> <span className="text-emerald-400 font-bold">{currentEdgeVal > 0 ? "+" : ""}{currentEdgeVal.toFixed(1)}%</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })()}

                    {/* FIGHTER PROFILES */}
                    <div className="grid md:grid-cols-2 gap-8 border-t border-white/5 pt-6">
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                                {resolvedF1Name || "Fighter 1"} Profile
                            </p>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {breakdown.fighter1Profile || breakdown.fighter1Notes || "No profile available."}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                                {resolvedF2Name || "Fighter 2"} Profile
                            </p>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {breakdown.fighter2Profile || breakdown.fighter2Notes || "No profile available."}
                            </p>
                        </div>
                    </div>

                    {/* OUTCOME DISTRIBUTION */}
                    <div className="space-y-3 pt-2">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Outcome Distribution</p>
                        <div className="p-3 bg-white/2 border border-white/5 rounded-lg">
                            <p className="font-mono text-sm text-gray-300">
                                {breakdown.outcomeDistribution || breakdown.pathToVictory?.replace(/\|/g, " | ") || "Calculating distribution..."}
                            </p>
                        </div>
                    </div>

                    {/* MAFS INTELLIGENCE — Core Thesis + Why This Is A Bet + Supporting Signals */}
                    {(() => {
                        const signals = breakdown.supportingSignals && breakdown.supportingSignals.length > 0
                            ? breakdown.supportingSignals
                            : breakdown.mafsIntelligence
                        const hasSignals = signals && signals.length > 0
                        const hasThesis = !!breakdown.coreThesis

                        // "Why this is a bet" — the main edge story. Try marketAnalysis first
                        // (the engine's market-psychology paragraph), then varianceReason /
                        // primaryRisk-flipped, then a synthesized sentence from any of
                        // modelLeaningOutcome / mispricing / ev that we have.
                        const marketAnalysisText = (Array.isArray(breakdown.marketAnalysis)
                            ? breakdown.marketAnalysis.join(" ")
                            : (breakdown.marketAnalysis || "")).trim()
                        const mispricingClean = (breakdown.mispricing || "").trim()
                        const evClean = (breakdown.ev || "").trim()
                        const outcomeClean = (breakdown.modelLeaningOutcome || breakdown.bet || "").trim()
                        const varianceReasonClean = (breakdown.varianceReason || "").trim()
                        const buildDerivedWhy = () => {
                            const parts: string[] = []
                            if (outcomeClean) parts.push(`Model leans ${outcomeClean}`)
                            if (mispricingClean) parts.push(`${mispricingClean} mispricing vs implied market`)
                            if (evClean) parts.push(`${evClean} expected return per unit`)
                            if (parts.length === 0) return ""
                            return parts.join(" — ").replace(/\s+—\s+/g, " — ") + "."
                        }
                        // Always render Why This Is A Bet — fall back to a generic line so
                        // every bet card's breakdown carries the section even when the engine
                        // didn't populate richer fields.
                        const whyText =
                            marketAnalysisText ||
                            buildDerivedWhy() ||
                            varianceReasonClean ||
                            "Model identified a pricing inefficiency between MAFS true line and the current market line. See True Line vs Market Line above for the implied probability gap."
                        const hasWhy = true
                        return (
                            <div className="pt-6 border-t border-white/5">
                                <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold mb-3">MAFS Intelligence</p>

                                {hasThesis && (
                                    <div className="mb-5 p-4 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/15">
                                        <p className="text-[9px] uppercase tracking-widest text-emerald-400/80 font-bold mb-2">Core Thesis</p>
                                        <p className="text-sm text-white/90 leading-relaxed">{breakdown.coreThesis}</p>
                                    </div>
                                )}

                                {hasWhy && (
                                    <div className="mb-5 p-4 rounded-lg bg-emerald-500/[0.03] border border-emerald-500/10">
                                        <p className="text-[9px] uppercase tracking-widest text-emerald-400/80 font-bold mb-2">Why This Is A Bet</p>
                                        <p className="text-sm text-white/85 leading-relaxed">{whyText}</p>
                                    </div>
                                )}

                                {hasSignals && (
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground/70 font-bold mb-3">Supporting Signals</p>
                                        <div className="space-y-2.5">
                                            {signals!.map((item, idx) => (
                                                <div key={idx} className="flex items-start gap-2">
                                                    <span className="text-[10px] font-medium text-primary/70 uppercase tracking-wide min-w-[100px] mt-0.5">{item.type}</span>
                                                    <span className="text-sm text-foreground/80 leading-snug">{item.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })()}

                    {/* MODEL METADATA BAR */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 p-5 bg-white/2 rounded-xl border border-white/5">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Model-Leaning Outcome</p>
                            <p className="text-sm font-bold text-white max-w-[140px] leading-tight" title={breakdown.modelLeaningOutcome || breakdown.bet}>
                                {breakdown.modelLeaningOutcome || breakdown.bet || "Analyzing..."}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Playable Up To</p>
                            <p className="text-sm font-bold text-emerald-400">
                                {breakdown.playableUpTo || breakdown.bet?.match(/[+-]\d+/)?.[0] || "current line"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Model Confidence</p>
                            <p className="text-xl font-bold text-white">
                                {breakdown.modelConfidence || breakdown.confidence || "N/A"}
                            </p>
                            <p className="text-[10px] text-muted-foreground">Agent agreement + matchup similarity</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Variance</p>
                            <p className="text-sm font-medium text-gray-300">
                                {breakdown.variance?.split("(")[0] || breakdown.risk || "Medium"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Signal Strength</p>
                            <p className="text-sm font-bold text-white">
                                {breakdown.signalStrength || breakdown.stake || "Moderate"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Recommended Stake</p>
                            <p className="text-sm font-bold text-emerald-400">—</p>
                            <p className="text-[10px] text-muted-foreground/50">Kelly-adjusted</p>
                        </div>
                    </div>

                    {/* PRIMARY RISK */}
                    <div className="rounded-lg bg-amber-950/20 border border-amber-500/20 p-4 mt-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" />
                            Primary Risk
                        </p>
                        <p className="text-sm text-amber-200/80">
                            {breakdown.primaryRisk || breakdown.varianceReason || "Standard market risk applies."}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}
