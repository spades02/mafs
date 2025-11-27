import { Button } from "@/components/ui/button"
import { CreditCard, Download, Check, Zap, Lock } from "lucide-react"

export default function BillingPage() {
  return (
    <main className="container mx-auto px-6 py-12 max-w-[1400px] animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-8">Billing & Subscription</h1>

      <div className="space-y-8">
        {/* Current Plan */}
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

        {/* Pricing Comparison */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Choose Your Plan</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-white/10 rounded-2xl p-8 hover-glow transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <p className="text-4xl font-bold text-white mb-1">
                $0<span className="text-lg text-gray-400">/mo</span>
              </p>
              <p className="text-sm text-gray-400 mb-6">Try MAFS with limited access</p>

              <ul className="space-y-3 mb-8">
                {[
                  "1 fight per day (not 3 or 5)",
                  "Main prediction card only",
                  "Props are blurred/locked",
                  "EV analysis locked",
                  "Risk flags locked",
                  "Agent pipeline locked",
                  "Parlay tools locked",
                  "Full breakdown locked",
                ].map((feature, i) => (
                  <li key={feature} className="flex items-center gap-3 text-gray-300">
                    {i === 0 || i === 1 ? (
                      <Check className="w-5 h-5 text-blue-400 shrink-0" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-600 shrink-0" />
                    )}
                    {feature}
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="w-full bg-transparent" disabled>
                Current Plan
              </Button>
            </div>

            {/* Pro */}
            <div className="bg-linear-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-2xl p-8 relative overflow-hidden hover-glow transition-all duration-300 transform hover:scale-[1.02]">
              <div className="absolute top-4 right-4 px-3 py-1 bg-linear-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg shadow-green-500/50 animate-glow-pulse-green">
                RECOMMENDED
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <p className="text-4xl font-bold text-white mb-1">
                $79<span className="text-lg text-gray-400">/mo</span>
              </p>
              <p className="text-sm text-gray-400 mb-6">For serious bettors who want the edge</p>

              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited fights",
                  "Unlimited simulations",
                  "Full multi-agent pipeline",
                  "Prop EV + parlay EV",
                  "All risk indicators",
                  "Historical performance",
                  "Saved plays",
                  "Priority analysis speed",
                  "Everything unlocked",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-white">
                    <Check className="w-5 h-5 text-green-400 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button className="w-full bg-linear-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 shadow-xl shadow-green-500/50 hover:shadow-2xl hover:shadow-green-500/60 hover:scale-105 active:scale-95 transition-all duration-300">
                <Zap className="w-4 h-4 mr-2" />
                Upgrade Now – $79/mo
              </Button>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-white/10 rounded-2xl p-8 hover-glow transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Payment Method (Stripe)</h2>
          </div>

          <p className="text-sm text-gray-400 mb-6">Secure payment processing powered by Stripe</p>

          <div className="grid gap-4 max-w-2xl">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Card Number</label>
              <input
                type="text"
                placeholder="4242 4242 4242 4242"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Expiry</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">CVC</label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Country</label>
                <input
                  type="text"
                  placeholder="US"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Billing History</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-400">Plan</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-400">Amount</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-400">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: "Dec 1, 2024", plan: "Pro", amount: "$49.00", status: "Paid" },
                  { date: "Nov 1, 2024", plan: "Pro", amount: "$49.00", status: "Paid" },
                  { date: "Oct 1, 2024", plan: "Pro", amount: "$49.00", status: "Paid" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-4 text-sm text-gray-300">{row.date}</td>
                    <td className="py-4 text-sm text-gray-300">{row.plan}</td>
                    <td className="py-4 text-sm text-white font-medium">{row.amount}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                        <Download className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
