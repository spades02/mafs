import { Button } from './ui/button'
import { Check, Lock, Zap } from 'lucide-react'

const ChoosePlan = () => {
  return (
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
)
}

export default ChoosePlan