import BillingHistory from "@/components/billing-history"
import ChoosePlan from "@/components/choose-plan"
import CurrentPlan from "@/components/current-plan"
import PaymentCard from "@/components/payment-card"
import { Button } from "@/components/ui/button"
import { CreditCard, Download, Check, Zap, Lock } from "lucide-react"

export default function BillingPage() {
  return (
    <main className="container mx-auto px-6 py-12 max-w-[1400px] animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-8">Billing & Subscription</h1>

      <div className="space-y-8">
        {/* Current Plan */}
        <CurrentPlan/>

        {/* Pricing Comparison */}
        <ChoosePlan />

        {/* Payment Method */}
        <PaymentCard />

        {/* Billing History */}
        <BillingHistory />
      </div>
    </main>
  )
}
