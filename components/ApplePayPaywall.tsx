"use client";

import { useRevenueCat } from "@/lib/hooks/useRevenueCat";
import type { PurchasesPackage } from "@revenuecat/purchases-capacitor";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ApplePayPaywallProps {
    userId: string | undefined;
    isPro: boolean;
}

/**
 * Native Apple IAP paywall for iOS Capacitor users.
 * 
 * Powered by RevenueCat — displays available subscription offerings
 * and triggers Apple's native purchase flow (FaceID/TouchID).
 * The backend webhook handles DB updates after successful purchases.
 */
export default function ApplePayPaywall({ userId, isPro }: ApplePayPaywallProps) {
    const {
        isConfigured,
        isLoading,
        currentOffering,
        purchasePackage,
        isPurchasing,
        error,
    } = useRevenueCat(userId);

    // Already subscribed
    if (isPro) {
        return <ProStatusCard />;
    }

    // Loading state
    if (isLoading) {
        return <PaywallSkeleton />;
    }

    // Error state
    if (error && !isConfigured) {
        return <PaywallError message={error} />;
    }

    // No offerings available
    if (!currentOffering || currentOffering.availablePackages.length === 0) {
        return <PaywallError message="No subscription plans available at this time." />;
    }

    const handlePurchase = async (pkg: PurchasesPackage) => {
        const success = await purchasePackage(pkg);
        if (success) {
            toast.success("Purchase successful!", {
                description: "Your Pro access will activate shortly.",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Upgrade to Pro</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Unlock unlimited fight analysis and premium features with an
                    in-app subscription.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {currentOffering.availablePackages.map((pkg) => (
                    <PackageCard
                        key={pkg.identifier}
                        pkg={pkg}
                        onPurchase={handlePurchase}
                        isPurchasing={isPurchasing}
                    />
                ))}
            </div>

            {error && (
                <p className="text-center text-sm text-destructive">{error}</p>
            )}

            <p className="text-center text-xs text-muted-foreground">
                Subscriptions are managed through your Apple ID. You can cancel anytime
                in Settings → Apple ID → Subscriptions.
            </p>
        </div>
    );
}

/** Individual subscription package card */
function PackageCard({
    pkg,
    onPurchase,
    isPurchasing,
}: {
    pkg: PurchasesPackage;
    onPurchase: (pkg: PurchasesPackage) => void;
    isPurchasing: boolean;
}) {
    const product = pkg.product;
    const priceString = product.priceString;
    const title = product.title || "Pro";
    const description = product.description || "Unlimited fight analysis";

    return (
        <Card
            className={cn(
                "relative overflow-hidden border-primary/20 shadow-md transition-all hover:shadow-lg",
            )}
        >
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                        <Crown className="h-3 w-3 mr-1" />
                        PRO
                    </Badge>
                </div>
                <CardDescription className="text-sm">{description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="space-y-1">
                    <span className="text-3xl font-bold">{priceString}</span>
                    <span className="text-sm text-muted-foreground">
                        /{pkg.packageType === "MONTHLY" ? "month" : pkg.packageType === "ANNUAL" ? "year" : "period"}
                    </span>
                </div>

                <ul className="space-y-2 text-sm">
                    <li className="flex gap-2 items-center">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>Unlimited Fight Analyses</span>
                    </li>
                    <li className="flex gap-2 items-center">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>Advanced Metrics & Edges</span>
                    </li>
                    <li className="flex gap-2 items-center">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>Auto Parlays & Combos</span>
                    </li>
                    <li className="flex gap-2 items-center">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>Early Access to Models</span>
                    </li>
                </ul>
            </CardContent>

            <CardFooter>
                <Button
                    className="w-full font-semibold"
                    size="lg"
                    onClick={() => onPurchase(pkg)}
                    disabled={isPurchasing}
                >
                    {isPurchasing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        "Subscribe"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}

/** Card shown when user is already Pro */
function ProStatusCard() {
    return (
        <Card className="border-primary/20 bg-primary/5 shadow-md">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <CardTitle>You&apos;re on Pro</CardTitle>
                        <CardDescription>
                            Full access to all premium features.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Manage your subscription in{" "}
                    <span className="font-medium text-foreground">
                        Settings → Apple ID → Subscriptions
                    </span>
                    .
                </p>
            </CardContent>
        </Card>
    );
}

/** Loading skeleton */
function PaywallSkeleton() {
    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="h-7 w-48 bg-muted/50 rounded-md mx-auto animate-pulse" />
                <div className="h-4 w-72 bg-muted/30 rounded-md mx-auto animate-pulse" />
            </div>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                {[1, 2].map((i) => (
                    <Card key={i} className="border-border/50">
                        <CardHeader>
                            <div className="h-5 w-24 bg-muted/50 rounded animate-pulse" />
                            <div className="h-4 w-40 bg-muted/30 rounded animate-pulse mt-2" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-20 bg-muted/50 rounded animate-pulse mb-4" />
                            <div className="space-y-2">
                                {[1, 2, 3].map((j) => (
                                    <div key={j} className="h-4 w-full bg-muted/20 rounded animate-pulse" />
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="h-10 w-full bg-muted/40 rounded-md animate-pulse" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

/** Error state */
function PaywallError({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                    Unable to Load Subscriptions
                </h3>
                <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
            </div>
        </div>
    );
}
