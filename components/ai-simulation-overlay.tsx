"use client"

import { useEffect, useState } from "react"
import { Brain, Database, Network, Shield, Lock, Cpu, Globe, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface AISimulationOverlayProps {
    isActive: boolean
    message?: string
}

const steps = [
    { text: "Initializing Neural Network...", icon: Brain },
    { text: "Fetching Historical Data...", icon: Database },
    { text: "Running 10,000 Simulations...", icon: Globe },
    { text: "Analyzing Fighter Biometrics...", icon: Network },
    { text: "Detecting Market Inefficiencies...", icon: Zap },
    { text: "Verifying Confidence Intervals...", icon: Shield },
    { text: "Simulation Complete.", icon: Lock },
]

export function AISimulationOverlay({ isActive, message }: AISimulationOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        if (isActive) {
            setCurrentStep(0)
            const interval = setInterval(() => {
                setCurrentStep((prev) => {
                    if (prev >= steps.length - 1) {
                        return prev // Stay at last step, wait for actual completion
                    }
                    return prev + 1
                })
            }, 600) // 600ms per step

            return () => clearInterval(interval)
        }
    }, [isActive])

    if (!isActive) return null

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0f14]/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

            <div className="relative z-10 w-full max-w-md p-8 text-center">
                <div className="mb-12 relative">
                    <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center relative">
                        <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin" />
                        <Cpu className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-primary/30 rounded-full animate-ping opacity-20" />
                </div>

                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-8">
                    MAFS Intelligence Engine
                </h2>

                {message && (
                    <p className="text-sm text-primary/80 font-mono mb-6 animate-pulse">
                        {">"} {message}
                    </p>
                )}

                <div className="space-y-4 text-left relative h-72 overflow-hidden mask-linear-gradient">
                    {steps.map((step, index) => {
                        const isActiveStep = index === currentStep
                        const isCompleted = index < currentStep

                        const isVisible = index <= currentStep

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-center gap-4 transition-all duration-300",
                                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
                                    isActiveStep ? 'text-green-400' : isCompleted ? 'text-green-500/50' : 'text-gray-500'
                                )}
                            >
                                <div className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center border transition-colors duration-300",
                                    isActiveStep ? 'border-green-400 bg-green-400/20' :
                                        isCompleted ? 'border-green-500/50 bg-green-500/10' :
                                            'border-gray-800'
                                )}>
                                    {isCompleted ? (
                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    ) : isActiveStep ? (
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    ) : (
                                        <div className="w-2 h-2 bg-gray-600 rounded-full" />
                                    )}
                                </div>
                                <span className={cn("font-mono text-sm", isActiveStep ? 'text-green-400 font-bold' : '')}>
                                    {step.text}
                                </span>
                                {isActiveStep && <span className="text-xs ml-auto animate-pulse">Processing...</span>}
                                {isCompleted && <span className="text-xs ml-auto text-green-500/50">Done</span>}
                            </div>
                        )
                    })}
                </div>

                <div className="mt-8 text-xs text-gray-500 font-mono">
                    System Load: {Math.floor(Math.random() * 30) + 40}% | Memory: {Math.floor(Math.random() * 20) + 12}GB
                </div>
            </div>
        </div>
    )
}
