import { TrendingUp } from 'lucide-react'

const MyPlaysGrid = () => {
  return (
    <div className="grid lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-foreground/10 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Total Units Risked</p>
          <p className="text-3xl font-bold text-foreground">12.5u</p>
        </div>
        <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-foreground/10 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">ROI</p>
          <p className="text-3xl font-bold text-green-400 flex items-center gap-2">
            +18.4%
            <TrendingUp className="w-5 h-5" />
          </p>
        </div>
        <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-foreground/10 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Win Rate</p>
          <p className="text-3xl font-bold text-foreground">62%</p>
        </div>
        <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-foreground/10 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-1">Pending Plays</p>
          <p className="text-3xl font-bold text-blue-400">3</p>
        </div>
    </div>  
      )
}

export default MyPlaysGrid