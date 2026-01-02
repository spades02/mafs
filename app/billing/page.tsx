import { auth } from "../lib/auth/auth";
import { headers } from "next/headers";
import BillingDashboard from "@/components/pages/billing/billing-dashboard";
import StripeProvider from "@/components/stripe/StripeProvider";

async function getUser() {
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
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto max-w-4xl px-4 py-12">
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Subscription & Billing</h1>
            <p className="text-muted-foreground">
              Manage your plan, billing details, and usage limits.
            </p>
          </div>

          <BillingDashboard user={user} />
        </main>
      </div>
    </StripeProvider>
  );
}