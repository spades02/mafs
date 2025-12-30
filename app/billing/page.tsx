// "use client"
import CurrentPlan from "@/components/pages/billing/current-plan"
import ChoosePlan from "@/components/pages/billing/choose-plan"
import PaymentCard from "@/components/pages/billing/payment-card"
import StripeProvider from "@/components/stripe/StripeProvider"
import UpgradeCard from "@/components/pages/billing/upgrade-card"
import { auth } from "../lib/auth/auth"
import { headers } from "next/headers"

async function getUser(){
  const nextHeaders = await headers();
  const session = await auth.api.getSession({
    headers: nextHeaders
  });
  return session?.user;
}

export default async function BillingPage() {
  const user = await getUser();
  return (
    <StripeProvider>
    <div className="min-h-screen">
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Billing</h1>

        {/* Current Plan */}
        {/* <CurrentPlan /> */}

        {/* Plans */}
        {/* <ChoosePlan /> */}

        {/* <UpgradeCard isPro={user.isPro!} /> */}

        {/* Payment Method */}
        <PaymentCard user={user} />
      </main>
    </div>
    </StripeProvider>
  )
}
