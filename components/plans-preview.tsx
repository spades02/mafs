import { Check } from 'lucide-react'
import React from 'react'

function PlansPreview() {
  return (
    <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground mb-4">Choose Your Plan</h3>

            {/* Free Plan */}
            <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-foreground/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-foreground">Free</h4>
                  <p className="text-2xl font-bold text-gray-300">
                    $0<span className="text-sm text-gray-500">/month</span>
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {["5 fights per day", "Basic prop analysis", "Standard support"].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-blue-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="bg-linear-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6 shadow-lg shadow-blue-500/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-bold text-foreground">Pro</h4>
                    <span className="px-2 py-0.5 bg-linear-to-r from-blue-500 to-cyan-500 text-foreground text-xs font-bold rounded-full">
                      POPULAR
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    $49<span className="text-sm text-gray-400">/month</span>
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {[
                  "Unlimited fights",
                  "Full agent breakdowns",
                  "Complete prop EV analysis",
                  "Priority model updates",
                  "Advanced analytics",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-cyan-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
  )
}

export default PlansPreview