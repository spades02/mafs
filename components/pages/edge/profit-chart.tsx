"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"

type Point = { ts: string; cumulativeUnits: number; cumulativeDollars: number }

type RangeKey = "30d" | "90d" | "all"

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "30d", label: "Last 30 Days" },
  { key: "90d", label: "Last 90 Days" },
  { key: "all", label: "All Time" },
]

const W = 800
const H = 260
const PAD_L = 12
const PAD_R = 12
const PAD_T = 16
const PAD_B = 28

function formatDollars(n: number): string {
  const sign = n >= 0 ? "+" : "-"
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function formatTickLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export function ProfitChart({ series }: { series: Point[] }) {
  const [range, setRange] = useState<RangeKey>("all")

  const data = useMemo(() => {
    if (series.length === 0) return []
    if (range === "all") return series
    const now = Date.now()
    const cutoffDays = range === "30d" ? 30 : 90
    const cutoff = now - cutoffDays * 24 * 60 * 60 * 1000
    return series.filter((p) => new Date(p.ts).getTime() >= cutoff)
  }, [series, range])

  const stats = useMemo(() => {
    if (data.length === 0) {
      return { min: 0, max: 0, peakIndex: -1, peakValue: 0, latest: 0 }
    }
    let min = Infinity
    let max = -Infinity
    let peakIndex = 0
    data.forEach((p, i) => {
      if (p.cumulativeDollars < min) min = p.cumulativeDollars
      if (p.cumulativeDollars > max) {
        max = p.cumulativeDollars
        peakIndex = i
      }
    })
    return {
      min,
      max,
      peakIndex,
      peakValue: max,
      latest: data[data.length - 1]?.cumulativeDollars ?? 0,
    }
  }, [data])

  if (series.length === 0) {
    return (
      <div className="rounded-xl border border-white/5 bg-[#0A0C10] p-8 text-center">
        <p className="text-sm text-muted-foreground/70">No graded picks yet — chart will appear here once results land.</p>
      </div>
    )
  }

  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const yMin = Math.min(0, stats.min)
  const yMax = Math.max(stats.max, 1)
  const yRange = yMax - yMin || 1
  const xCount = Math.max(data.length - 1, 1)

  const xAt = (i: number) => PAD_L + (i / xCount) * innerW
  const yAt = (v: number) => PAD_T + innerH - ((v - yMin) / yRange) * innerH
  const yZero = yAt(0)

  const linePath = data
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(2)} ${yAt(p.cumulativeDollars).toFixed(2)}`)
    .join(" ")

  const areaPath =
    data.length > 0
      ? `${linePath} L ${xAt(data.length - 1).toFixed(2)} ${yZero.toFixed(2)} L ${xAt(0).toFixed(2)} ${yZero.toFixed(2)} Z`
      : ""

  const peakX = stats.peakIndex >= 0 ? xAt(stats.peakIndex) : 0
  const peakY = stats.peakIndex >= 0 ? yAt(stats.peakValue) : 0

  const firstDate = data[0] ? new Date(data[0].ts) : null
  const lastDate = data[data.length - 1] ? new Date(data[data.length - 1].ts) : null
  const midDate =
    data.length > 2 ? new Date(data[Math.floor(data.length / 2)].ts) : null

  return (
    <div className="rounded-xl border border-white/5 bg-[#0A0C10] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-base sm:text-lg font-semibold text-white">Profit Over Time</h2>
        <div className="flex items-center gap-1 rounded-full bg-white/[0.03] border border-white/5 p-1">
          {RANGES.map((r) => {
            const active = r.key === range
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-medium transition-colors",
                  active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-white",
                )}
              >
                {r.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-[240px] sm:h-[280px]"
          role="img"
          aria-label="Profit over time chart"
        >
          <defs>
            <linearGradient id="profit-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(52, 211, 153)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="rgb(52, 211, 153)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Zero line */}
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={yZero}
            y2={yZero}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="3 3"
          />

          {areaPath && <path d={areaPath} fill="url(#profit-area)" />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="rgb(52, 211, 153)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {stats.peakIndex >= 0 && (
            <g>
              <line
                x1={peakX}
                x2={peakX}
                y1={peakY}
                y2={H - PAD_B}
                stroke="rgba(52, 211, 153, 0.35)"
                strokeDasharray="2 3"
              />
              <circle cx={peakX} cy={peakY} r={5} fill="rgb(52, 211, 153)" />
              <circle cx={peakX} cy={peakY} r={9} fill="rgb(52, 211, 153)" fillOpacity={0.2} />
            </g>
          )}
        </svg>

        {stats.peakIndex >= 0 && (
          <div
            className="absolute pointer-events-none px-2 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 tabular-nums shadow-lg"
            style={{
              left: `calc(${(peakX / W) * 100}% - 36px)`,
              top: `calc(${(peakY / H) * 100}% - 32px)`,
            }}
          >
            {formatDollars(stats.peakValue)}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground/60 tabular-nums">
        <span>{firstDate ? formatTickLabel(firstDate) : ""}</span>
        {midDate && <span>{formatTickLabel(midDate)}</span>}
        <span>{lastDate ? formatTickLabel(lastDate) : ""}</span>
      </div>
    </div>
  )
}
