"use client";

import { useState } from "react";
import { createCustomerPortalSession } from "@/app/actions/stripe";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card";
import { Progress } from "../../ui/progress";
import { Badge } from "../../ui/badge";
import { Check, CreditCard, ShieldCheck, Lock, Sparkles, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import WebPaymentBoundary from "@/components/WebPaymentBoundary";

interface BillingDashboardProps {
  user: {
    id: string;
    email: string;
    isPro: boolean;
    isElite?: boolean;
    subscriptionTier?: string;
    analysisCount: number;
    stripeCustomerId?: string | null;
    // ... other fields
  } | null | undefined;
}

export default function BillingDashboard({ user }: BillingDashboardProps) {
  const [loading, setLoading] = useState(false);

  // Constants & Logic derived from your AnalysisButton
  const MAX_FREE_ANALYSES = 3;
  const analysisCount = user?.analysisCount || 0;
  const isPro = user?.isPro || false;
  const isElite = user?.isElite || false;
  const tier: "free" | "pro" | "elite" =
    user?.subscriptionTier === "elite" || user?.subscriptionTier === "pro" || user?.subscriptionTier === "free"
      ? user.subscriptionTier
      : isElite
        ? "elite"
        : isPro
          ? "pro"
          : "free";
  const tierLabel = tier === "elite" ? "ELITE" : tier === "pro" ? "PRO" : "FREE";

  const remainingFree = Math.max(0, MAX_FREE_ANALYSES - analysisCount);
  const hasFreeLimitReached = !isPro && remainingFree === 0;

  // Calculate percentage for the progress bar
  const usagePercent = Math.min((analysisCount / MAX_FREE_ANALYSES) * 100, 100);

  const handleUpgrade = (tier: "pro" | "elite" = "pro") => {
    if (!user) return;
    const base =
      tier === "elite"
        ? process.env.NEXT_PUBLIC_STRIPE_ELITE_CHECKOUT_URL || process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL
        : process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL;
    if (!base) return;
    const link = `${base}?client_reference_id=${user.id}&prefilled_email=${user.email}`;
    window.open(link, '_blank');
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const { url, error } = await createCustomerPortalSession();
      if (url) {
        window.location.href = url;
        return;
      }
      if (error) {
        console.error(error);
        toast.error(
          error === "unauthorized"
            ? "Please sign in to manage your subscription."
            : "Couldn't open the billing portal. Please try again or contact support.",
        );
      } else {
        toast.error("Couldn't open the billing portal. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Couldn't reach Stripe. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8 text-center text-muted-foreground">Loading user data...</div>;

  const currentPlanBadgeClass =
    tier === "elite"
      ? "bg-primary/90 hover:bg-primary text-primary-foreground"
      : tier === "pro"
        ? "bg-emerald-600 hover:bg-emerald-700"
        : "";

  return (
    <div className="space-y-8">
    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">

      {/* LEFT COLUMN: Current Status & Usage */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Current Plan</CardTitle>
              <Badge variant={isPro ? "default" : "secondary"} className={cn("px-3 py-1", currentPlanBadgeClass)}>
                {tierLabel}
              </Badge>
            </div>
            <CardDescription>
              {tier === "elite"
                ? "AI Gameplan engine active. Automated weekly portfolios."
                : tier === "pro"
                  ? "You have full access to all premium features."
                  : "You are currently on the limited free tier."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isPro ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Monthly Analysis Usage</span>
                </div>

                {/* VISUAL STYLE FROM YOUR ANALYSIS BUTTON */}
                <div className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md text-sm",
                  hasFreeLimitReached ? "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400" : "bg-muted text-muted-foreground"
                )}>
                  <div className="flex items-center gap-2">
                    {hasFreeLimitReached ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    <span>
                      {hasFreeLimitReached ? "Limit Reached" : "Analyses Used"}
                    </span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {analysisCount} / {MAX_FREE_ANALYSES}
                  </span>
                </div>

                <Progress value={usagePercent} className={cn("h-2", hasFreeLimitReached && "[&>div]:bg-red-500")} />

                <p className="text-xs text-muted-foreground">
                  {hasFreeLimitReached
                    ? "You have used all your free analyses for this month."
                    : `${remainingFree} analyses remaining before limit is reached.`
                  }
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-lg border bg-secondary/10 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Unlimited Access</p>
                  <p className="text-sm text-muted-foreground">No limits on fight analysis.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method Section */}
        <Card className="border-border/50 shadow-sm opacity-80">
          <CardHeader>
            <CardTitle className="text-lg">Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4 text-sm text-muted-foreground">
            <CreditCard className="h-5 w-5" />
            {isPro ? "Managed via Stripe Secure Portal" : "No payment method on file"}
          </CardContent>
          {isPro && (
            <CardFooter>
              <WebPaymentBoundary>
                <Button variant="outline" size="sm" onClick={handleManageSubscription} disabled={loading}>
                  {loading ? "Loading..." : "Update Payment Details"}
                </Button>
              </WebPaymentBoundary>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* RIGHT COLUMN: Manage / quick CTA */}
      <div className="lg:col-span-1">
        {isPro ? (
          <Card className="h-full border-primary/20 bg-primary/5 shadow-md flex justify-between">
            <div className="gap-2">
              <CardHeader>
                <CardTitle>Manage Subscription</CardTitle>
                <CardDescription>View invoices, change plans, or cancel.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>As a {tierLabel} user, you have:</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited fight analyses</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Full card EV engine &amp; edges</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Auto parlays &amp; combos</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Priority support</li>
                  {isElite && (
                    <>
                      <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> 1,000 automated weekly simulations</li>
                      <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> AI Gameplan portfolio builder</li>
                    </>
                  )}
                </ul>
              </CardContent>
            </div>
            <CardFooter>
              <WebPaymentBoundary>
                <Button className="w-full" variant="default" onClick={handleManageSubscription} disabled={loading}>
                  {loading ? "Processing..." : "Open Customer Portal"}
                </Button>
              </WebPaymentBoundary>
            </CardFooter>
          </Card>
        ) : (
          <Card className={cn(
            "relative h-full overflow-hidden shadow-lg transition-all",
            hasFreeLimitReached ? "border-amber-500/50 ring-1 ring-amber-500/20" : "border-primary"
          )}>
            <div className={cn(
              "absolute inset-0 bg-linear-to-br via-transparent to-transparent pointer-events-none",
              hasFreeLimitReached ? "from-amber-500/10" : "from-primary/10"
            )} />
            <CardHeader>
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-lg mb-4 text-primary-foreground",
                hasFreeLimitReached ? "bg-amber-500" : "bg-primary"
              )}>
                {hasFreeLimitReached ? <Lock className="h-6 w-6 text-black" /> : <Zap className="h-6 w-6" />}
              </div>
              <CardTitle className="text-2xl">
                {hasFreeLimitReached ? "Limit Reached" : "Upgrade to unlock more"}
              </CardTitle>
              <CardDescription>
                {hasFreeLimitReached
                  ? "You've hit the free limit. Pick a plan below to continue."
                  : "Choose Pro for unlimited sims, or Elite for the full AI Gameplan."}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              See available plans below.
            </CardContent>
          </Card>
        )}
      </div>
    </div>

    {/* SECOND ROW — Upgrade picker. Hidden once user is on Elite. */}
    {tier !== "elite" && (
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{tier === "free" ? "Choose your plan" : "Upgrade to Elite"}</h2>
          <p className="text-sm text-muted-foreground">
            {tier === "free"
              ? "Pro = unlimited manual simulations. Elite = automated weekly Gameplan."
              : "Let MAFS run 1,000 simulations weekly and build your portfolio for you."}
          </p>
        </div>
        <div className={cn("grid gap-6", tier === "free" ? "md:grid-cols-2" : "md:grid-cols-1 max-w-xl")}>
          {tier === "free" && (
            <Card className="border-primary/40 bg-[#0f1419] shadow-[0_0_30px_-10px_hsl(var(--primary)/0.25)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary">Pro</CardTitle>
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-primary mt-1">Founding Member Pricing</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-lg text-muted-foreground line-through">$69</span>
                  <span className="text-3xl font-bold">$39</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="mt-2">Unlimited manual simulations and the full edge engine.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited simulation runs</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Full edge detection system</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Smart ticket recommendations</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Saved plays &amp; history</li>
                </ul>
              </CardContent>
              <CardFooter>
                <WebPaymentBoundary>
                  <Button className="w-full bg-primary text-black hover:bg-primary/90" onClick={() => handleUpgrade("pro")} disabled={loading}>
                    {loading ? "Processing..." : "Unlock Pro — $39/mo"}
                  </Button>
                </WebPaymentBoundary>
              </CardFooter>
            </Card>
          )}

          <Card className="border-primary/50 bg-[#0f1419] shadow-[0_0_30px_-10px_hsl(var(--primary)/0.4)] relative">
            <div className="absolute top-0 right-3 -translate-y-1/2 bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-primary/40">
              Most Advanced
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary">Elite</CardTitle>
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-primary mt-1">Founding Member Pricing</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-lg text-muted-foreground line-through">$149</span>
                <span className="text-3xl font-bold text-primary">$99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription className="mt-2">
                MAFS runs 1,000 simulations weekly and assembles the highest-EV portfolio for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> 1,000 automated weekly simulations</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> AI Gameplan portfolio builder</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Kelly-based stake sizing</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Top recurring outcome detection</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Bankroll &amp; portfolio risk balancing</li>
              </ul>
            </CardContent>
            <CardFooter>
              <WebPaymentBoundary>
                <Button className="w-full bg-primary text-black hover:bg-primary/90 font-semibold" onClick={() => handleUpgrade("elite")} disabled={loading}>
                  {loading ? "Processing..." : "Activate AI Gameplan — $99/mo"}
                </Button>
              </WebPaymentBoundary>
            </CardFooter>
          </Card>
        </div>
      </div>
    )}
    </div>
  );
}