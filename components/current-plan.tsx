import { Button } from './ui/button'
import { Zap } from 'lucide-react'

const CurrentPlan = () => {
  return (
    <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-white/10 rounded-2xl p-8 hover-glow">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Current Plan</h2>
              <p className="text-3xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Free Plan
              </p>
              <p className="text-sm text-gray-400 mt-1">1 fight per day • Limited features</p>
            </div>
            <Button className="bg-linear-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 shadow-xl shadow-green-500/50 hover:shadow-2xl hover:shadow-green-500/60 hover:scale-105 transition-all duration-300 animate-glow-pulse-green">
              <Zap className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
            <div>
              <p className="text-sm text-gray-400">Next Billing Date</p>
              <p className="text-lg font-semibold text-white">—</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Fights Used Today</p>
              <p className="text-lg font-semibold text-white">0 / 1</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Monthly Spend</p>
              <p className="text-lg font-semibold text-white">$0.00</p>
            </div>
          </div>
        </div>
)
}

export default CurrentPlan