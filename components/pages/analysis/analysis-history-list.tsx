"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Plus, Calendar, Trophy, ChevronRight, Activity, ArrowUpRight } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AnalysisRunSummary {
    id: string
    title: string
    createdAt: Date
    betCount: number
    topBet?: string
}

interface AnalysisHistoryListProps {
    runs: AnalysisRunSummary[]
}

export function AnalysisHistoryList({ runs }: AnalysisHistoryListProps) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")

    const filteredRuns = runs.filter((run) =>
        run.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen premium-bg overflow-y-hidden neural-bg font-sans selection:bg-primary/30 pb-20 relative">
            {/* Background Effects */}
            <div className="hero-orb fixed top-0 left-1/4 opacity-30" />
            <div className="hero-orb-secondary fixed bottom-0 right-1/4 opacity-30" />
            <div className="scanlines fixed inset-0 pointer-events-none" />

            <div className="container mx-auto px-4 py-8 relative z-10 max-w-5xl">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div>
                        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Analysis History</h1>
                        <p className="text-muted-foreground text-lg">
                            Review your past simulations and performance insights.
                        </p>
                    </div>
                    <Button
                        size="lg"
                        onClick={() => router.push("/dashboard")}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Analysis
                    </Button>
                </div>

                {/* Search & Filter */}
                <div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-emerald-500/50"
                        />
                    </div>
                </div>

                {/* List Grid */}
                <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    {filteredRuns.length > 0 ? (
                        filteredRuns.map((run, i) => (
                            <Link href={`/analysis/${run.id}`} key={run.id}
                                className="group block"
                            >
                                <Card className="bg-black/40 border-white/5 hover:bg-white/[0.02] hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.1)]">
                                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">

                                        {/* Left: Event Info */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                                <Trophy className="w-6 h-6 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors mb-1">
                                                    {run.title}
                                                </h3>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(run.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                                                    </span>
                                                    {run.betCount > 0 && (
                                                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                                                            <Activity className="w-3 h-3" />
                                                            {run.betCount} Opportunities
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Top Bet & Action */}
                                        <div className="flex items-center gap-6 mt-2 md:mt-0 md:ml-auto">
                                            {run.topBet && (
                                                <div className="hidden md:block text-right">
                                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Top Identified Edge</p>
                                                    <p className="text-sm font-medium text-white/90">{run.topBet}</p>
                                                </div>
                                            )}

                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </div>
                                        </div>

                                    </CardContent>

                                    {/* Hover Gradient Line */}
                                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-linear-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/50 transition-all duration-500" />
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-black/20 rounded-2xl border border-white/5 border-dashed">
                            <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-white mb-2">No Analyses Found</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                {searchQuery ? "Try adjusting your search terms." : "You haven't run any simulations yet. Start your first analysis to see insights here."}
                            </p>
                            {!searchQuery && (
                                <Button
                                    onClick={() => router.push("/dashboard")}
                                    variant="outline"
                                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                >
                                    Start Simulation
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
