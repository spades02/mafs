"use client"

import { useEffect, useState, useRef } from "react"
import { TrendingUp, AlertTriangle, CheckCircle2, MinusCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCountUp } from "@/lib/hooks/use-count-up"

// ── Confidence Ring with animated SVG draw-on ──────────────────────
export function ConfidenceRing({ value, size = 60 }: { value: number; size?: number }) {
    const radius = size * 0.4
    const circumference = 2 * Math.PI * radius
    const [offset, setOffset] = useState(circumference) // start fully hidden
    const [showLabel, setShowLabel] = useState(false)

    const color = value >= 75 ? "#4ade80" : value >= 60 ? "#facc15" : "#f87171"

    useEffect(() => {
        // Small delay so the component mounts first, then the ring draws in
        const drawTimer = setTimeout(() => {
            setOffset(circumference - (value / 100) * circumference)
        }, 150)
        const labelTimer = setTimeout(() => setShowLabel(true), 400)
        return () => { clearTimeout(drawTimer); clearTimeout(labelTimer) }
    }, [value, circumference])

    // Reset when value changes (re-simulation)
    useEffect(() => {
        setOffset(circumference)
        setShowLabel(false)
        const drawTimer = setTimeout(() => {
            setOffset(circumference - (value / 100) * circumference)
        }, 150)
        const labelTimer = setTimeout(() => setShowLabel(true), 400)
        return () => { clearTimeout(drawTimer); clearTimeout(labelTimer) }
    }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

    const displayValue = useCountUp(showLabel ? Math.round(value) : 0, 1200)

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="4"
                    fill="transparent"
                />
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke={color}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    fill="transparent"
                    strokeLinecap="round"
                    style={{
                        transition: "stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.5s ease",
                        filter: `drop-shadow(0 0 6px ${color}40)`
                    }}
                />
            </svg>
            <span
                className={cn(
                    "absolute text-xs font-bold transition-all duration-500",
                    showLabel ? "opacity-100 scale-100" : "opacity-0 scale-75"
                )}
                style={{ color }}
            >
                {displayValue}%
            </span>
        </div>
    )
}

// ── Edge Meter with animated fill from zero ────────────────────────
export function EdgeMeter({ value }: { value: number }) {
    const [animated, setAnimated] = useState(false)

    useEffect(() => {
        setAnimated(false)
        const timer = setTimeout(() => setAnimated(true), 200)
        return () => clearTimeout(timer)
    }, [value])

    const clampedValue = Math.max(-20, Math.min(20, animated ? value : 0))
    const percentage = ((clampedValue + 20) / 40) * 100
    const isPositive = value > 0

    const displayValue = useCountUp(animated ? value : 0, 1400, 1)

    return (
        <div className="w-full">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1 font-mono">
                <span>-20%</span>
                <span>0%</span>
                <span>+20%</span>
            </div>
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20 -translate-x-1/2 z-10" />
                <div
                    className={cn(
                        "absolute top-0 bottom-0 rounded-full",
                        isPositive ? "bg-green-500" : "bg-red-500"
                    )}
                    style={{
                        left: isPositive ? '50%' : `${percentage}%`,
                        width: animated ? (isPositive ? `${percentage - 50}%` : `${50 - percentage}%`) : '0%',
                        transition: "all 1.4s cubic-bezier(0.16, 1, 0.3, 1)",
                        boxShadow: animated ? `0 0 8px ${isPositive ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}` : 'none'
                    }}
                />
            </div>
            <div className={cn(
                "text-center mt-1 text-sm font-bold transition-all duration-700",
                value > 0 ? "text-green-500" : value < 0 ? "text-red-500" : "text-muted-foreground",
                animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}>
                {displayValue > 0 ? "+" : ""}{displayValue.toFixed(1)}%
            </div>
        </div>
    )
}

// ── Animated Stat with count-up ────────────────────────────────────
export function AnimatedStat({ value, label, prefix = "", suffix = "" }: { value: number; label: string; prefix?: string; suffix?: string }) {
    const displayValue = useCountUp(value, 1500)

    return (
        <div className="text-center">
            <div className="text-3xl font-bold glow-text text-foreground number-roll">
                {prefix}{Math.round(displayValue)}{suffix}
            </div>
            {label && <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{label}</div>}
        </div>
    )
}

// ── Model Agreement bars ───────────────────────────────────────────
export function ModelAgreement({ agents }: { agents: Array<{ name: string; signal: "pass" | "neutral" | "fail"; desc: string }> }) {
    return (
        <div className="flex items-center justify-between gap-2 w-full">
            {agents.map((agent, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div className={cn(
                        "w-full h-1.5 rounded-full transition-all duration-500",
                        agent.signal === "pass" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" :
                            agent.signal === "neutral" ? "bg-yellow-500" : "bg-red-500"
                    )} />
                    <span className="text-[9px] text-muted-foreground/70 uppercase tracking-tighter truncate w-full text-center">
                        {agent.name.split(" ")[0]}
                    </span>
                </div>
            ))}
        </div>
    )
}

// ── Variance Indicator with entrance animation ─────────────────────
export function VarianceIndicator({ level }: { level: "low" | "medium" | "high" }) {
    const [mounted, setMounted] = useState(false)
    const color = level === "low" ? "text-green-500" : level === "medium" ? "text-yellow-500" : "text-red-500"
    const Icon = level === "low" ? CheckCircle2 : level === "medium" ? MinusCircle : AlertTriangle

    useEffect(() => {
        setMounted(false)
        const timer = setTimeout(() => setMounted(true), 300)
        return () => clearTimeout(timer)
    }, [level])

    return (
        <div className={cn(
            "flex items-center gap-1.5 transition-all duration-500",
            color,
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
        )}>
            <Icon className="w-5 h-5" />
        </div>
    )
}
