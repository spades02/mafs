"use client"

import { Fight } from "@/app/(app)/dashboard/d-types"
import { formatOdds } from "@/lib/odds/utils"

interface FightTableProps {
    fights: Fight[]
    selectedFightId: string | null
    onSelectFight: (id: string | null) => void
    oddsFormat?: string
}

export function FightTable({ fights, selectedFightId, onSelectFight, oddsFormat = "american" }: FightTableProps) {
    return (
        <section className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-2xl font-semibold mb-1 text-white">All Fights on This Card</h2>
            <p className="text-sm text-muted-foreground mb-6">Listed for reference only — not recommendations</p>

            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="divide-y divide-white/5">
                    {fights.map((fight) => (
                        <div
                            key={fight.id}
                            onClick={() => onSelectFight(selectedFightId === fight.id ? null : fight.id)}
                            className={`group flex items-center justify-between p-5 cursor-pointer transition-all duration-200 hover:bg-white/[0.03] ${selectedFightId === fight.id
                                ? "bg-emerald-500/[0.08] border-l-2 border-emerald-500 pl-[18px]"
                                : "border-l-2 border-transparent pl-5"
                                }`}
                        >
                            <p className="font-semibold text-gray-100 text-sm md:text-base group-hover:text-white transition-colors">
                                {fight.matchup}
                            </p>
                            <div className="flex items-center gap-6">
                                <p className="text-sm text-muted-foreground font-mono tracking-tight">{formatOdds(fight.odds, oddsFormat)}</p>
                                <span className={`text-xs font-medium uppercase tracking-wider transition-colors ${selectedFightId === fight.id ? "text-emerald-400" : "text-emerald-500/80 group-hover:text-emerald-400"
                                    }`}>
                                    View Analysis
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
