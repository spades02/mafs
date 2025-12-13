"use client"
import { plays } from '@/lib/data/plays'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useState } from 'react'

const AllPlaysTable = () => {
  const [eventFilter, setEventFilter] = useState("all")
  const [resultsFilter, setResultsFilter] = useState("all")
  
  const filteredPlays = plays.filter((play) =>{
    const statusMatch = resultsFilter === "all" || play.status == resultsFilter;
    const eventMatch = eventFilter === "all" || play.event === eventFilter;
    return statusMatch && eventMatch ;
  });

  return (
    <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-foreground/10 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">All Plays</h2>
          <div className="flex gap-2">
            <Select onValueChange={setEventFilter}>
              <SelectTrigger className="px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-lg text-sm text-foreground">
                  <SelectValue placeholder="All Events" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="ufc-300">UFC 300</SelectItem>
              <SelectItem value="ufc-299">UFC 299  </SelectItem>
              <SelectItem value="ufc-298">UFC 298  </SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setResultsFilter}>
              <SelectTrigger className="px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-lg text-sm text-foreground">
                <SelectValue placeholder="All Results"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-foreground/10">
                <th className="text-left py-3 text-sm font-medium text-gray-400">Fight</th>
                <th className="text-left py-3 text-sm font-medium text-gray-400">Bet Type</th>
                <th className="text-left py-3 text-sm font-medium text-gray-400">Odds</th>
                <th className="text-left py-3 text-sm font-medium text-gray-400">Stake</th>
                <th className="text-left py-3 text-sm font-medium text-gray-400">EV</th>
                <th className="text-left py-3 text-sm font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlays.map((play, i) => (
                <tr key={i} className="border-b border-foreground/5 hover:bg-foreground/5 transition-colors">
                  <td className="py-4 text-sm text-foreground font-medium">{play.fight}</td>
                  <td className="py-4 text-sm text-gray-300">{play.type}</td>
                  <td className="py-4 text-sm text-gray-300">{play.odds}</td>
                  <td className="py-4 text-sm text-foreground font-medium">{play.stake}</td>
                  <td className="py-4 text-sm text-green-400 font-medium">{play.ev}</td>
                  <td className="py-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        play.status === "pending"
                          ? "bg-blue-500/20 text-blue-400"
                          : play.status === "won"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {play.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
)
}

export default AllPlaysTable