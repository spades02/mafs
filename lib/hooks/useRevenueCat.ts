"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import {
    Purchases,
    type PurchasesOffering,
    type PurchasesPackage,
    PURCHASES_ERROR_CODE,
} from "@revenuecat/purchases-capacitor";

interface UseRevenueCatReturn {
    /** Whether the SDK has been configured and offerings loaded */
    isConfigured: boolean;
    /** Whether offerings are still loading */
    isLoading: boolean;
    /** The current offering with available packages (subscription tiers) */
    currentOffering: PurchasesOffering | null;
    /** Purchase a specific package — triggers Apple's native IAP flow */
    purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
    /** Whether a purchase is currently in progress */
    isPurchasing: boolean;
    /** Last error message (null if no error) */
    error: string | null;
}

/**
 * Hook to initialize RevenueCat SDK and manage Apple IAP on iOS Capacitor.
 * 
 * - Only activates on iOS native (no-op on web/Android)
 * - Calls `Purchases.logIn()` with the user's Better Auth ID  
 * - Fetches available offerings/packages for the paywall UI
 * - Handles purchase flow with graceful cancellation handling
 * 
 * @param userId - The Better Auth user ID (from session)
 */
export function useRevenueCat(userId: string | undefined): UseRevenueCatReturn {
    const [isConfigured, setIsConfigured] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const configuredRef = useRef(false);

    // Initialize SDK & fetch offerings
    useEffect(() => {
        const isNativeiOS =
            Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";

        if (!isNativeiOS) {
            setIsLoading(false);
            return;
        }

        const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_APPLE_KEY;
        if (!apiKey) {
            console.error("[RevenueCat] Missing NEXT_PUBLIC_REVENUECAT_APPLE_KEY");
            setError("RevenueCat API key not configured");
            setIsLoading(false);
            return;
        }

        async function init() {
            try {
                // Only configure once
                if (!configuredRef.current) {
                    await Purchases.configure({ apiKey: apiKey! });
                    configuredRef.current = true;
                }

                // Log in the user so RevenueCat ties purchases to our DB user ID
                if (userId) {
                    await Purchases.logIn({ appUserID: userId });
                }

                // Fetch available subscription offerings
                const offeringsResult = await Purchases.getOfferings();
                if (offeringsResult.current) {
                    setCurrentOffering(offeringsResult.current);
                }

                setIsConfigured(true);
                setError(null);
            } catch (err: any) {
                console.error("[RevenueCat] Init error:", err);
                setError(err?.message || "Failed to initialize RevenueCat");
            } finally {
                setIsLoading(false);
            }
        }

        init();
    }, [userId]);

    // Purchase a package
    const purchasePackage = useCallback(
        async (pkg: PurchasesPackage): Promise<boolean> => {
            setIsPurchasing(true);
            setError(null);

            try {
                await Purchases.purchasePackage({ aPackage: pkg });
                // Purchase successful — webhook will update DB
                return true;
            } catch (err: any) {
                // User cancelled — this is NOT an error, don't show error UI
                if (err?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
                    console.log("[RevenueCat] User cancelled purchase");
                    return false;
                }

                console.error("[RevenueCat] Purchase error:", err);
                setError(err?.message || "Purchase failed. Please try again.");
                return false;
            } finally {
                setIsPurchasing(false);
            }
        },
        [],
    );

    return {
        isConfigured,
        isLoading,
        currentOffering,
        purchasePackage,
        isPurchasing,
        error,
    };
}
