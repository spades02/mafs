
import { TrendingUp } from "lucide-react"

export default function MyPlaysPage() {
  const plays = [
    { fight: "Pereira vs Hill", type: "ML Pereira", odds: "-180", stake: "2u", ev: "+8.2%", status: "pending" },
    { fight: "Oliveira vs Chandler", type: "KO/TKO", odds: "+220", stake: "1u", ev: "+12.5%", status: "won" },
    { fight: "Volkanovski vs Holloway", type: "Over 4.5", odds: "-110", stake: "1.5u", ev: "+5.3%", status: "lost" },
    { fight: "Zhang vs Esparza", type: "Under 2.5", odds: "+180", stake: "1u", ev: "+15.1%", status: "won" },
  ]

  return (
    <main className="container mx-auto px-6 py-12 max-w-[1600px]">
      <h1 className="text-3xl font-bold text-white mb-8">My Plays</h1>

      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-white/10 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Total Units Risked</p>
          <p className="text-3xl font-bold text-white">12.5u</p>
        </div>
        <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-white/10 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">ROI</p>
          <p className="text-3xl font-bold text-green-400 flex items-center gap-2">
            +18.4%
            <TrendingUp className="w-5 h-5" />
          </p>
        </div>
        <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-white/10 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Win Rate</p>
          <p className="text-3xl font-bold text-white">62%</p>
        </div>
        <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-white/10 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Pending Plays</p>
          <p className="text-3xl font-bold text-blue-400">3</p>
        </div>
      </div>

      <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-white/10 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">All Plays</h2>
          <div className="flex gap-2">
            <select className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white">
              <option>All Events</option>
              <option>UFC 300</option>
              <option>UFC 299</option>
            </select>
            <select className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white">
              <option>All Results</option>
              <option>Pending</option>
              <option>Won</option>
              <option>Lost</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 text-sm font-medium text-gray-400">Fight</th>
                <th className="text-left py-3 text-sm font-medium text-gray-400">Bet Type</th>
                <th className="text-left py-3 text-sm font-medium text-gray-400">Odds</th>
                <th className="text-left py-3 text-sm font-medium text-gray-400">Stake</th>
                <th className="text-left py-3 text-sm font-medium text-gray-400">EV</th>
                <th className="text-left py-3 text-sm font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {plays.map((play, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 text-sm text-white font-medium">{play.fight}</td>
                  <td className="py-4 text-sm text-gray-300">{play.type}</td>
                  <td className="py-4 text-sm text-gray-300">{play.odds}</td>
                  <td className="py-4 text-sm text-white font-medium">{play.stake}</td>
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
    </main>
  )
}
