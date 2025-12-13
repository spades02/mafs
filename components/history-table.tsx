"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ChevronDown, TrendingUp } from 'lucide-react'
import { Label } from './ui/label'
import { events } from '@/lib/data/history'
import { useState } from 'react'
import { Input } from './ui/input'

const HistoryTable = () => {
    const [expandedEvent, setExpandedEvent] = useState<number | null>(null)
    const [eventsFilter, setEventsFilter] = useState("all")

    const filteredEvents = events.filter((event) =>{
      const eventDate = new Date(event.date);
      const today = new Date();
      // const date = new Date();

      if(eventsFilter === "all") return true;

      if(eventsFilter === "month"){
        const monthAgo = new Date(); 
        monthAgo.setDate(today.getDate()-30);
        return eventDate >= monthAgo && eventDate <= today;
      }
      if(eventsFilter === "quarter"){
        const quarter = new Date();
        quarter.setMonth(today.getMonth() - 3);
        return eventDate >= quarter && eventDate <= today;
      }
      if(eventsFilter === "year"){
        const year = new Date();
        year.setFullYear(today.getFullYear() - 1);
        return eventDate >= year && eventDate <= today;
      }
      return true;
    })

  return (
    <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-foreground/10 rounded-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Input
            type="text"
            placeholder="Search events..."
            className="flex-1 px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg text-foreground placeholder:text-gray-500"
          />
          <Select value={eventsFilter} onValueChange={setEventsFilter}>
            <SelectTrigger className="flex justify-between gap-2 px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-lg text-sm text-foreground">
                <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 3 Months</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <div>
          <Label className="flex items-center text-sm text-gray-300">
            <Input type="checkbox" className="rounded h-4" />
            <span className='foregroundspace-nowrap'>Official AI Plays Only</span>
          </Label>
          </div>
        </div>

        <div className="space-y-4">
          {filteredEvents.map((event, i) => (
            <div key={i} className="border border-foreground/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedEvent(expandedEvent === i ? null : i)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-foreground/5 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground text-left">{event.name}</h3>
                    <p className="text-sm text-gray-400">{event.date}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-gray-400">Record</p>
                      <p className="text-foreground font-medium">{event.record}</p>
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
                      <p className="text-foreground font-medium">{event.units}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Hit Rate</p>
                      <p className="text-foreground font-medium">{event.hitRate}</p>
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedEvent === i ? "rotate-180" : ""}`}
                />
              </button>

              {expandedEvent === i && (
                <div className="px-6 py-4 border-t border-foreground/10 bg-foreground/5">
                  <p className="text-sm text-gray-400 mb-4">Fight Results</p>
                  <div className="space-y-2">
                    {["Pereira ML ✓", "Oliveira KO/TKO ✓", "Holloway Over 4.5 ✗", "Zhang Under 2.5 ✓"].map(
                      (fight, j) => (
                        <div key={j} className="flex items-center justify-between py-2 px-4 bg-foreground/5 rounded-lg">
                          <span className="text-sm text-foreground">{fight}</span>
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
)
}

export default HistoryTable