import { Check } from 'lucide-react'

function PlansPreview() {
  return (
    <div className="space-y-4 text-primary">
            <h3 className="text-xl font-bold mb-4">Choose Your Plan</h3>

            {/* Free Plan */}
            <div className="bg-linear-to-br from-[#0f1419] to-[#0b0f14] border border-foreground/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold">Free</h4>
                  <p className="text-2xl font-bold">
                    $0<span className="text-sm text-gray-500">/month</span>
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {["5 fights per day", "Basic prop analysis", "Standard support"].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="bg-linear-to-br from-primary/10 to-primary/10 border border-primary/30 rounded-xl p-6 shadow-lg shadow-primary/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-bold">Pro</h4>
                    <span className="px-2 py-0.5 bg-linear-to-r from-primary/20 to-primary/40 text-xs font-bold rounded-full">
                      POPULAR
                    </span>
                  </div>
                  <p className="text-2xl font-bold">
                    $49<span className="text-sm text-gray-500">/month</span>
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
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
  )
}

export default PlansPreview