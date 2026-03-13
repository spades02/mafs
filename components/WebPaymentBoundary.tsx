"use client";

import { ReactNode } from "react";
import { useNativePlatform } from "@/lib/hooks/useNativePlatform";
import { Smartphone } from "lucide-react";

interface WebPaymentBoundaryProps {
    children: ReactNode;
    /** Optional custom fallback UI for iOS native users */
    fallback?: ReactNode;
}

/**
 * Conditionally renders Stripe/payment components.
 * 
 * - During hydration (before platform check completes): renders nothing to prevent layout shift
 * - On iOS native (Capacitor): renders the fallback UI
 * - On web / Android: renders children normally
 */
export default function WebPaymentBoundary({
    children,
    fallback,
}: WebPaymentBoundaryProps) {
    const { isNativeiOS, isReady } = useNativePlatform();

    // Still evaluating platform — render nothing to prevent layout shift
    if (!isReady) {
        return null;
    }

    // iOS native — show fallback
    if (isNativeiOS) {
        return (
            <>
                {fallback ?? <DefaultIOSFallback />}
            </>
        );
    }

    // Web or Android — render Stripe content normally
    return <>{children}</>;
}

/** Default styled fallback message for iOS users */
function DefaultIOSFallback() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border/50 bg-muted/30 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Smartphone className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                    Web-Only Feature
                </h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                    Subscription management and purchases are currently only available on
                    the web. Please visit{" "}
                    <span className="font-medium text-primary">mafs.ai</span> in your
                    browser to manage your plan.
                </p>
            </div>
        </div>
    );
}
