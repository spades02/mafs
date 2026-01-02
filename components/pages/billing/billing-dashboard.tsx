"use client";

import { useState } from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card";
import { Progress } from "../../ui/progress";
import { Badge } from "../../ui/badge";
import { Check, CreditCard, ShieldCheck, Lock, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface BillingDashboardProps {
  user: {
    id: string;
    email: string;
    isPro: boolean;
    analysisCount: number;
    // ... other fields
  } | null | undefined;
}

export default function BillingDashboard({ user }: BillingDashboardProps) {
  const [loading, setLoading] = useState(false);

  // Constants & Logic derived from your AnalysisButton
  const MAX_FREE_ANALYSES = 3;
  const analysisCount = user?.analysisCount || 0;
  const isPro = user?.isPro || false;
  
  const remainingFree = Math.max(0, MAX_FREE_ANALYSES - analysisCount);
  const hasFreeLimitReached = !isPro && remainingFree === 0;
  
  // Calculate percentage for the progress bar
  const usagePercent = Math.min((analysisCount / MAX_FREE_ANALYSES) * 100, 100);

    const handleUpgrade = async () => {
        console.log("clicked")
        setLoading(true);
        try {
        const res = await fetch("/api/stripe/subscribe", { method: "POST" });
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        if (data.url) window.location.href = data.url;
        } catch (err) {
        console.error("Upgrade error:", err);
        } finally {
        setLoading(false);
        }
    };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8 text-center text-muted-foreground">Loading user data...</div>;

  return (
    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
      
      {/* LEFT COLUMN: Current Status & Usage */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Current Plan</CardTitle>
              <Badge variant={isPro ? "default" : "secondary"} className={cn("px-3 py-1", isPro ? "bg-emerald-600 hover:bg-emerald-700" : "")}>
                {isPro ? "PRO" : "FREE"}
              </Badge>
            </div>
            <CardDescription>
              {isPro 
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
                <Button variant="outline" size="sm" onClick={handleManageSubscription} disabled={loading}>
                  {loading ? "Loading..." : "Update Payment Details"}
                </Button>
             </CardFooter>
          )}
        </Card>
      </div>

      {/* RIGHT COLUMN: Action Card */}
      <div className="lg:col-span-1">
        {isPro ? (
          // PRO USER VIEW
          <Card className="h-full border-primary/20 bg-primary/5 shadow-md flex justify-between">
            <div className="gap-2">
            <CardHeader>
              <CardTitle>Manage Subscription</CardTitle>
              <CardDescription>View invoices, change plans, or cancel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <ul className="space-y-2 text-sm text-muted-foreground">
                <li>As a Pro User, you have:</li>
                 <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited Analyses</li>
                 <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Advanced Metrics</li>
                 <li className="flex gap-2"><Check className="h-4 w-4 text-primary" /> Priority Support</li>
               </ul>
            </CardContent>
            </div>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="default"
                onClick={handleManageSubscription} 
                disabled={loading}
              >
                {loading ? "Processing..." : "Open Customer Portal"}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          // FREE USER VIEW (Upsell)
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
                {hasFreeLimitReached ? "Limit Reached" : "Upgrade to Pro"}
              </CardTitle>
              <CardDescription>
                {hasFreeLimitReached 
                  ? "You've hit the monthly limit. Upgrade now to continue analyzing fights." 
                  : "Unlock the full potential of your analytics."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-1">
                <span className="text-3xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>Unlimited Fight Analyses</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>Detailed Fighter Breakdowns</span>
                </li>
              </ul>
            </CardContent>

            <CardFooter>
              {/* BUTTON STYLE COPIED FROM YOUR INSPIRATION */}
              <Button 
              type="button"
                className={cn(
                  "w-full font-semibold shadow-md",
                  hasFreeLimitReached 
                    ? "bg-linear-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-400 hover:to-amber-400" 
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                )}
                size="lg"
                onClick={handleUpgrade}
                disabled={loading}
              >
                {loading ? "Processing..." : (hasFreeLimitReached ? "Upgrade for Unlimited Runs" : "Upgrade Now")}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}