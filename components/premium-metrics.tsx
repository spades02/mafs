"use client"

import { useEffect, useState } from "react"
import { TrendingUp, AlertTriangle, CheckCircle2, MinusCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function ConfidenceRing({ value, size = 60 }: { value: number; size?: number }) {
    const radius = size * 0.4
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (value / 100) * circumference

    const color = value >= 75 ? "#4ade80" : value >= 60 ? "#facc15" : "#f87171"

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="rgba(255,255,255,0.1)"
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
                    strokeDashoffset={strokeDashoffset}
                    fill="transparent"
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <span className="absolute text-xs font-bold" style={{ color }}>{Math.round(value)}%</span>
        </div>
    )
}

export function EdgeMeter({ value }: { value: number }) {
    // Clamp value between -20 and 20 for display purposes in the meter
    const clampedValue = Math.max(-20, Math.min(20, value))
    const percentage = ((clampedValue + 20) / 40) * 100

    const isPositive = value > 0

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
                        "absolute top-0 bottom-0 transition-all duration-1000 ease-out",
                        isPositive ? "bg-green-500" : "bg-red-500"
                    )}
                    style={{
                        left: isPositive ? '50%' : `${percentage}%`,
                        width: isPositive ? `${percentage - 50}%` : `${50 - percentage}%`
                    }}
                />
            </div>
            <div className={cn(
                "text-center mt-1 text-sm font-bold",
                value > 0 ? "text-green-500" : value < 0 ? "text-red-500" : "text-muted-foreground"
            )}>
                {value > 0 ? "+" : ""}{value.toFixed(1)}%
            </div>
        </div>
    )
}

import { useCountUp } from "@/lib/hooks/use-count-up"

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

export function VarianceIndicator({ level }: { level: "low" | "medium" | "high" }) {
    const color = level === "low" ? "text-green-500" : level === "medium" ? "text-yellow-500" : "text-red-500"
    const Icon = level === "low" ? CheckCircle2 : level === "medium" ? MinusCircle : AlertTriangle

    return (
        <div className={cn("flex items-center gap-1.5", color)}>
            <Icon className="w-5 h-5" />
        </div>
    )
}
