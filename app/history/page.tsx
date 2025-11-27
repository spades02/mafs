"use client"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { SelectTrigger } from "@radix-ui/react-select"
import { ChevronDown, TrendingUp } from "lucide-react"
import { useState } from "react"

export default function HistoryPage() {
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null)

  const events = [
    { name: "UFC 300", date: "Apr 13, 2024", record: "8-2", roi: "+24.5%", units: "+4.8u", hitRate: "80%" },
    { name: "UFC 299", date: "Mar 9, 2024", record: "6-4", roi: "+12.3%", units: "+2.1u", hitRate: "60%" },
    { name: "UFC 298", date: "Feb 17, 2024", record: "7-3", roi: "+18.7%", units: "+3.5u", hitRate: "70%" },
  ]

  return (
    <main className="container mx-auto px-6 py-12 max-w-[1600px]">
      <h1 className="text-3xl font-bold text-white mb-8">History</h1>
        {/* Might turn this to a client component later */}
      <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-white/10 rounded-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search events..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500"
          />
          <Select>
            <SelectTrigger className="flex justify-between gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white">
                <SelectValue placeholder="All Events" />
                <ChevronDown/>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 3 Months</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" className="rounded" />
            Official AI Plays Only
          </Label>
        </div>

        <div className="space-y-4">
          {events.map((event, i) => (
            <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedEvent(expandedEvent === i ? null : i)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-white text-left">{event.name}</h3>
                    <p className="text-sm text-gray-400">{event.date}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-gray-400">Record</p>
                      <p className="text-white font-medium">{event.record}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">ROI</p>
                      <p className="text-green-400 font-medium flex items-center gap-1">
                        {event.roi}
                        <TrendingUp className="w-4 h-4" />
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Units</p>
                      <p className="text-white font-medium">{event.units}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Hit Rate</p>
                      <p className="text-white font-medium">{event.hitRate}</p>
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedEvent === i ? "rotate-180" : ""}`}
                />
              </button>

              {expandedEvent === i && (
                <div className="px-6 py-4 border-t border-white/10 bg-white/5">
                  <p className="text-sm text-gray-400 mb-4">Fight Results</p>
                  <div className="space-y-2">
                    {["Pereira ML ✓", "Oliveira KO/TKO ✓", "Holloway Over 4.5 ✗", "Zhang Under 2.5 ✓"].map(
                      (fight, j) => (
                        <div key={j} className="flex items-center justify-between py-2 px-4 bg-white/5 rounded-lg">
                          <span className="text-sm text-white">{fight}</span>
                          <span
                            className={`text-xs font-medium ${fight.includes("✓") ? "text-green-400" : "text-red-400"}`}
                          >
                            {fight.includes("✓") ? "WON" : "LOST"}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
