import { Check } from "lucide-react"

/**
 * RiskReversal
 * A trust-building section that reassures visitors before the final CTA.
 * Displays cancellation policy and commitment-free messaging.
 */

const guarantees = [
  "Cancel anytime",
  "No long-term commitment",
  "One edge can cover your subscription",
]

function RiskReversal() {
  return (
    <section className="py-12 md:py-16 px-4 border-t border-border/5">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center">
          <h3 className="text-xl md:text-2xl font-semibold mb-8 tracking-tight">
            Try MAFS risk-free
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground/70">
            {guarantees.map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/8 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[15px]">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default RiskReversal
