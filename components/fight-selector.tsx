"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Search, Brain, Zap } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAnalysisStore } from "@/store/useAnalysisStore"
import { fights } from "@/lib/data/fights"
import { events } from "@/lib/data/events"
import { Fight } from "@/lib/data/mock-data"

export function FightSelector({
  selectedFightIndex,
  setSelectedFightIndex
}: {
  selectedFightIndex: number
  setSelectedFightIndex: (index: number) => void
}) {
  const [selectedEvent, setSelectedEvent] = useState("")
  const [oddsMode, setOddsMode] = useState<"live" | "manual">("live")
  const [fighterAOdds, setFighterAOdds] = useState("")
  const [fighterBOdds, setFighterBOdds] = useState("")
  const [open, setOpen] = useState(false)

const canAnalyze =
  selectedEvent &&
  selectedFightIndex !== null &&
  (oddsMode === "live" || (fighterAOdds && fighterBOdds));

  const setAnalysisRun = useAnalysisStore((s) => s.setAnalysisRun);

  const handleAnalysisRun = () => {
    setAnalysisRun(true);
  };

  const setAnalysisRunFalse = () =>{
    setAnalysisRun(false);
  }

  return (
    <div className="relative rounded-3xl border border-white/30 bg-linear-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-2xl p-10 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-500 overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-linear(0deg, transparent, transparent 40px, rgba(99, 179, 237, 0.3) 40px, rgba(99, 179, 237, 0.3) 41px),
              repeating-linear-linear(90deg, transparent, transparent 40px, rgba(99, 179, 237, 0.3) 40px, rgba(99, 179, 237, 0.3) 41px)
            `,
          }}
        />
      </div>

      {/* Neon edge glow effect */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none">
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-linear-to-r from-cyan-400/0 via-cyan-400/50 to-cyan-400/0 bg-clip-border animate-pulse" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Title section */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/40">
              <Brain className="w-5 h-5 text-white" />
            </div>
            Choose Your Fight
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Select an event and matchup below, then let our AI analyze the fight to generate the best bets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-white/90 flex items-center gap-2">
              Event
              <span className="text-[10px] text-gray-500 font-normal">(Required)</span>
            </Label>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="bg-slate-950/60 border-white/30 text-white hover:border-cyan-400/60 focus:border-cyan-400 transition-all h-12 rounded-xl shadow-lg hover:shadow-cyan-500/20 focus:ring-2 focus:ring-cyan-400/50">
                <SelectValue placeholder="Select UFC event..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/20">
                {events.map((event: { value: string; label: string }) => (
                  <SelectItem key={event.value} value={event.value} className="text-white hover:bg-slate-800">
                    {event.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-white/90 flex items-center gap-2">
              Matchup
              <span className="text-[10px] text-gray-500 font-normal">(Required)</span>
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between bg-slate-950/60 border-white/30 text-white hover:text-white hover:bg-slate-900/60 hover:border-cyan-400/60 focus:border-cyan-400 transition-all h-12 rounded-xl shadow-lg hover:shadow-cyan-500/20 focus:ring-2 focus:ring-cyan-400/50"
                >
                {selectedFightIndex !== null
  ? fights[selectedFightIndex].label
  : "Search fighters..."}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[360px] p-0 bg-slate-900 border-white/20 shadow-2xl">
                <Command className="bg-slate-900 text-white">
                  <CommandInput placeholder="Type fighter names..." className="h-12" />
                  <CommandList>
                    <CommandEmpty>No fight found.</CommandEmpty>
                    <CommandGroup>
                      {fights.map((fight: { value: string; label: string }) => (
                        <CommandItem
                          key={fight.value}
                          value={fight.value}
                          onSelect={(id: string) => {
                            console.log(id)
                            const idx = fights.findIndex((f) => f.value === id)
                            setSelectedFightIndex(idx)
                            setAnalysisRunFalse();
                            setOpen(false)
                          }}

                          className="py-3 text-white hover:bg-slate-800 cursor-pointer"
                        >
                          {fight.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-white/90">Odds Source</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => setOddsMode("live")}
                className={`flex-1 h-12 rounded-xl font-semibold transition-all duration-300 ${
                  oddsMode === "live"
                    ? "bg-linear-to-r from-cyan-500 via-blue-500 to-cyan-500 hover:from-cyan-600 hover:via-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/50 border-0"
                    : "bg-slate-950/40 border border-white/20 text-gray-400 hover:bg-slate-900/60 hover:text-white hover:border-white/40"
                }`}
              >
                <Zap className="w-4 h-4 mr-1.5" />
                Use Live Odds
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setOddsMode("manual")}
                className={`flex-1 h-12 rounded-xl font-semibold transition-all duration-300 ${
                  oddsMode === "manual"
                    ? "bg-linear-to-r from-cyan-500 via-blue-500 to-cyan-500 hover:from-cyan-600 hover:via-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/50 border-0"
                    : "bg-slate-950/40 border border-white/20 text-gray-400 hover:bg-slate-900/60 hover:text-white hover:border-white/40"
                }`}
              >
                Enter Odds Manually
              </Button>
            </div>

            {oddsMode === "manual" && (
              <div className="grid grid-cols-2 gap-3 mt-4 animate-expand">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-400 font-medium">Fighter A Odds</Label>
                  <Input
                    type="text"
                    placeholder="-150"
                    value={fighterAOdds}
                    onChange={(e) => setFighterAOdds(e.target.value)}
                    className="bg-slate-950/60 border-white/20 text-white placeholder:text-gray-600 text-sm h-10 rounded-lg focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-400 font-medium">Fighter B Odds</Label>
                  <Input
                    type="text"
                    placeholder="+130"
                    value={fighterBOdds}
                    onChange={(e) => setFighterBOdds(e.target.value)}
                    className="bg-slate-950/60 border-white/20 text-white placeholder:text-gray-600 text-sm h-10 rounded-lg focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all shadow-inner"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-transparent select-none">Action</Label>
            <Button
              onClick={handleAnalysisRun}
              disabled={!canAnalyze}
              size="lg"
              className="w-full bg-linear-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white font-bold shadow-2xl shadow-green-500/60 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none h-12 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group border-0"
            >
              {/* Pulse animation overlay */}
              <div className="absolute inset-0 bg-linear-to-r from-green-400/0 via-white/20 to-green-400/0 translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Brain className="mr-2 h-5 w-5 relative z-10" />
              <span className="relative z-10">Run Multi-Agent Analysis</span>
            </Button>
            <p className="text-[10px] text-gray-500 text-center leading-tight px-2">
              8 specialized AI agents will analyze this fight in seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
