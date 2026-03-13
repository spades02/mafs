"use client";

import WebPaymentBoundary from "@/components/WebPaymentBoundary";
import StripeProvider from "@/components/stripe/StripeProvider";
import BillingDashboard from "@/components/pages/billing/billing-dashboard";
import ApplePayPaywall from "@/components/ApplePayPaywall";

interface BillingPageClientProps {
    user: {
        id: string;
        email: string;
        isPro: boolean;
        analysisCount: number;
        stripeCustomerId?: string | null;
    } | null | undefined;
}

/**
 * Client-side billing wrapper that gates the billing experience
 * behind platform detection.
 * 
 * - iOS Capacitor: renders ApplePayPaywall (native IAP via RevenueCat)
 * - Web/Android: renders Stripe billing dashboard
 */
export default function BillingPageClient({ user }: BillingPageClientProps) {
    return (
        <WebPaymentBoundary
            fallback={
                <ApplePayPaywall
                    userId={user?.id}
                    isPro={user?.isPro ?? false}
                />
            }
        >
            <StripeProvider>
                <BillingDashboard user={user} />
            </StripeProvider>
        </WebPaymentBoundary>
    );
}
