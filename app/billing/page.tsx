import CurrentPlan from "@/components/pages/billing/current-plan"
import ChoosePlan from "@/components/pages/billing/choose-plan"
import PaymentCard from "@/components/pages/billing/payment-card"

export default function BillingPage() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Billing</h1>

        {/* Current Plan */}
        <CurrentPlan />

        {/* Plans */}
        <ChoosePlan />

        {/* Payment Method */}
        <PaymentCard />
      </main>
    </div>
  )
}
