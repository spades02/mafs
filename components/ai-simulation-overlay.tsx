"use client"

import { useEffect, useState } from "react"
import { Brain, CheckCircle2, Circle, Activity, Shield, Zap, BarChart3, Network, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface AISimulationOverlayProps {
    isActive: boolean
    message?: string
    progress?: number
}

const steps = [
    { id: 1, label: "Loading fight data" },
    { id: 2, label: "Initializing agents" },
    { id: 3, label: "Running 10,000 simulations" },
    { id: 4, label: "Building consensus" },
    { id: 5, label: "Applying safety filters" },
]

const agents = [
    { name: "Pattern Recognition", icon: Brain, color: "text-emerald-400" },
    { name: "Market Analysis", icon: BarChart3, color: "text-blue-400" },
    { name: "Risk Assessment", icon: Shield, color: "text-amber-400" },
    { name: "Edge Detection", icon: Zap, color: "text-purple-400" },
]

export function AISimulationOverlay({ isActive, message, progress: manualProgress }: AISimulationOverlayProps) {
    const [progress, setProgress] = useState(0)
    const [activeStep, setActiveStep] = useState(0)
    const [agentProgress, setAgentProgress] = useState<Record<string, number>>({})
    const [convergence, setConvergence] = useState(0)

    useEffect(() => {
        if (isActive) {
            // Reset internal state if we just activated
            if (manualProgress === undefined || manualProgress === 0) {
                setProgress(0)
                setActiveStep(0)
                setAgentProgress({})
                setConvergence(0)
            }
        }
    }, [isActive])

    // Auto-progress logic to keep visual movement
    useEffect(() => {
        if (manualProgress !== undefined && isActive) {
            // If manual progress jumps ahead, catch up immediately
            setProgress(prev => Math.max(prev, manualProgress))
        }
    }, [manualProgress, isActive])

    // Smooth creep animation
    useEffect(() => {
        if (!isActive || manualProgress === undefined) return;

        const interval = setInterval(() => {
            setProgress(prev => {
                // don't exceed 99% until complete
                if (prev >= 99) return prev;

                // Allow drifting up to 15% ahead of manual progress to show activity
                // But if manual is VERY low (start), drift closer to 25% to indicate "working"
                const buffer = prev < 20 ? 25 : 15;
                if (prev >= manualProgress + buffer) return prev;

                // Slow down as we get higher
                const increment = prev > 80 ? 0.05 : 0.15;
                return prev + increment
            })
        }, 50)

        return () => clearInterval(interval)
    }, [isActive, manualProgress])

    // Update visuals based on internal progress
    useEffect(() => {
        // Map progress to steps roughly
        const estimatedStep = Math.min(4, Math.floor((progress / 100) * 5))
        setActiveStep(estimatedStep)

        // Map progress to convergence
        setConvergence(Math.min(99, progress * 0.95))

        // Update agents
        if (progress > 5) {
            const newAgents: Record<string, number> = {}
            agents.forEach((a, idx) => {
                // Stagger agents
                const lag = idx * 8
                newAgents[a.name] = Math.min(100, Math.max(0, (progress - 5 - lag) * 2.8))
            })
            setAgentProgress(newAgents)
        }
    }, [progress])

    useEffect(() => {
        if (isActive && manualProgress === undefined) {
            // ... existing fake simulation logic ...
            // Reset
            setProgress(0)
            setActiveStep(0)
            setAgentProgress({})
            setConvergence(0)

            // Main Progress Simulation
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 95) return 95 // Cap at 95% if manual not driven
                    // Non-linear progress just for feel
                    const diff = 100 - prev
                    const increment = Math.max(0.5, Math.random() * (diff / 20))
                    return Math.min(95, prev + increment)
                })
            }, 100)

            // Step Simulation
            const stepInterval = setInterval(() => {
                setActiveStep(prev => {
                    if (prev >= steps.length - 1) return prev
                    return prev + 1
                })
            }, 2500) // Slower steps

            // Agent Status Simulation
            const agentInterval = setInterval(() => {
                setAgentProgress(prev => {
                    const next = { ...prev }
                    agents.forEach(agent => {
                        const current = prev[agent.name] || 0
                        if (current < 100) {
                            // Random increments
                            next[agent.name] = Math.min(100, current + Math.random() * 15)
                        }
                    })
                    return next
                })
            }, 300)

            // Convergence Simulation
            const convergenceInterval = setInterval(() => {
                setConvergence(prev => {
                    if (prev >= 98) return 98
                    return Math.min(99, prev + Math.random() * 3)
                })
            }, 200)

            return () => {
                clearInterval(progressInterval)
                clearInterval(stepInterval)
                clearInterval(agentInterval)
                clearInterval(convergenceInterval)
            }
        }
    }, [isActive, manualProgress])

    // Independent Convergence Simulation
    useEffect(() => {
        if (isActive) {
            const interval = setInterval(() => {
                setConvergence(prev => {
                    // Jitter between 75% and 99% regardless of progress
                    const target = 75 + Math.random() * 24
                    // Smooth transition
                    return prev + (target - prev) * 0.1
                })
            }, 800)
            return () => clearInterval(interval)
        }
    }, [isActive])

    if (!isActive) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            {/* Main Card */}
            <div className="relative w-full max-w-4xl bg-[#0b0f14] border border-white/10 rounded-3xl p-8 overflow-hidden shadow-2xl">

                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

                {/* Header Section */}
                <div className="mb-10 relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Brain className="w-8 h-8 text-primary animate-pulse" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-green-500 tracking-wider">LIVE</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground/40">|</span>
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">MMA Analytics Platform</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">MAFS Intelligence Engine</h2>
                                <p className="text-sm text-muted-foreground">Multi-agent simulation in progress</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Progress Bar */}
                    <div className="relative pt-4">
                        <div className="flex justify-between text-xs uppercase tracking-wider font-medium text-muted-foreground mb-2">
                            <span>Processing</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">

                    {/* Left Column: Process Steps */}
                    <div className="space-y-6">
                        {steps.map((step, idx) => {
                            const isComplete = idx < activeStep
                            const isCurrent = idx === activeStep

                            return (
                                <div key={step.id} className="flex items-center gap-4 group">
                                    <div className="relative">
                                        {isComplete ? (
                                            <div className="w-6 h-6 rounded-full bg-green-500/10 border border-green-500/50 flex items-center justify-center">
                                                <Check className="w-3.5 h-3.5 text-green-500" />
                                            </div>
                                        ) : isCurrent ? (
                                            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10" />
                                        )}
                                        {/* Connector Line */}
                                        {idx !== steps.length - 1 && (
                                            <div className="absolute top-6 left-3 -ml-px w-px h-6 bg-white/5 group-hover:bg-white/10 transition-colors" />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-sm font-medium transition-colors",
                                        isComplete ? "text-muted-foreground/60" :
                                            isCurrent ? "text-white" : "text-muted-foreground/40"
                                    )}>
                                        {step.label}
                                    </span>
                                    {isCurrent && (
                                        <Activity className="w-4 h-4 text-primary ml-auto animate-pulse" />
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Right Column: Agent Grid */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {agents.map((agent) => {
                                const val = agentProgress[agent.name] || 0
                                const isDone = val >= 100

                                return (
                                    <div key={agent.name} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden">
                                        {/* Status Badge */}
                                        <div className="flex justify-between items-start mb-2">
                                            <agent.icon className={cn("w-5 h-5", agent.color, "opacity-80")} />
                                            {isDone && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/20">
                                                    PASS
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-gray-300 mb-2">{agent.name}</p>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full transition-all duration-500", agent.color.replace('text-', 'bg-'))}
                                                    style={{ width: `${val}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Active Glow */}
                                        {!isDone && val > 0 && (
                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/5 pointer-events-none" />
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Convergence Footer */}
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Network className="w-5 h-5 text-primary" />
                                <span className="text-sm font-medium text-gray-400">Model Convergence</span>
                            </div>
                            <div className="flex items-end gap-1">
                                <div className="flex gap-1 h-6 items-end mr-3">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div
                                            key={i}
                                            className={cn("w-1 rounded-sm bg-primary/30", i <= Math.ceil((convergence / 100) * 5) && "bg-primary")}
                                            style={{ height: `${20 + Math.random() * 80}%` }}
                                        />
                                    ))}
                                </div>
                                <span className="text-xl font-bold text-white leading-none">{Math.round(convergence)}%</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}
