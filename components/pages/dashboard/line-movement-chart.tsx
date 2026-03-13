"use client"

import { useMemo } from "react"
import { OddsHistoryPoint } from "@/app/(app)/dashboard/d-types"
import { formatOdds } from "@/lib/odds/utils"

interface LineMovementChartProps {
    data: OddsHistoryPoint[]
    openingOdds?: number
    currentOdds?: number
    className?: string
    width?: number | string
    height?: number
    color?: string
}

export function LineMovementChart({
    data,
    openingOdds,
    currentOdds,
    className = "",
    width = "100%",
    height = 40,
    color = "#10b981", // default emerald-500
}: LineMovementChartProps) {
    // If we don't have enough data points, just show a flat line or nothing
    if (!data || data.length < 2) {
        if (openingOdds && currentOdds) {
            // Mock a 2-point line just to show something if we have opening/current but no true history yet
            data = [
                { timestamp: "open", oddsAmerican: openingOdds },
                { timestamp: "current", oddsAmerican: currentOdds }
            ]
        } else {
            return (
                <div className={`flex items-center justify-center text-[10px] text-muted-foreground/50 italic ${className}`} style={{ height }}>
                    No line movement data
                </div>
            )
        }
    }

    const { path, minVal, maxVal, firstPoint, lastPoint } = useMemo(() => {
        // Convert American odds to a linear scale for plotting.
        // Positive odds are easy (+150 > +100). Negative (-150 < -100).
        // A simple way is just to plot the raw integer since the math holds up spatially.
        const values = data.map(d => d.oddsAmerican)

        const min = Math.min(...values)
        const max = Math.max(...values)

        // Add a tiny bit of padding so lines don't hit the exact top/bottom bounds perfectly
        const range = Math.max(max - min, 10) // minimum range of 10
        const paddedMin = min - (range * 0.1)
        const paddedMax = max + (range * 0.1)
        const paddedRange = paddedMax - paddedMin

        // Generate SVG path string
        const pts = values.map((val, i) => {
            const x = (i / (values.length - 1)) * 100 // % width
            // Y is inverted because SVG 0,0 is top-left
            const y = 100 - (((val - paddedMin) / paddedRange) * 100)
            return `${x},${y}`
        })

        const d = `M ${pts.join(" L ")}`

        return {
            path: d,
            minVal: min,
            maxVal: max,
            firstPoint: data[0].oddsAmerican,
            lastPoint: data[data.length - 1].oddsAmerican
        }

    }, [data])

    // Generate a unique ID for the gradient to prevent conflicts if multiple charts render
    const gradientId = useMemo(() => `sparkline-gradient-${Math.random().toString(36).substring(2, 9)}`, [])

    const isTrendingUp = lastPoint > firstPoint
    const isTrendingDown = lastPoint < firstPoint
    const chartColor = color // We can make this dynamic later based on favorable/unfavorable movement

    return (
        <div className={`relative flex items-center w-full ${className}`}>

            {/* The actual SVG Sparkline */}
            <div className="flex-1 w-full" style={{ height: `${height}px` }}>
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="overflow-visible"
                >
                    <defs>
                        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor={chartColor} stopOpacity={0.25} />
                            <stop offset="100%" stopColor={chartColor} stopOpacity={0.0} />
                        </linearGradient>
                    </defs>

                    {/* Gradient fill under the line */}
                    <path
                        d={`${path} L 100,100 L 0,100 Z`}
                        fill={`url(#${gradientId})`}
                        stroke="none"
                    />

                    {/* The stroke line */}
                    <path
                        d={path}
                        fill="none"
                        stroke={chartColor}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* End point dot */}
                    <circle
                        cx="100"
                        cy={100 - (((lastPoint - (minVal - (Math.max(maxVal - minVal, 10)) * 0.1)) / ((maxVal + (Math.max(maxVal - minVal, 10)) * 0.1) - (minVal - (Math.max(maxVal - minVal, 10)) * 0.1))) * 100)}
                        r="3.5"
                        fill={chartColor}
                        className="animate-pulse"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            </div>

            {/* Opening Price Label on the right (matching prototype) */}
            <div className="flex flex-col justify-center ml-3 shrink-0">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 leading-none mb-0.5">OP</span>
                <span className="text-xs font-mono font-bold text-white leading-none">
                    {formatOdds(firstPoint, "american")}
                </span>
            </div>
        </div>
    )
}
