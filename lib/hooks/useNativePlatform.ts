"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

/**
 * Client-safe hook to detect if the app is running natively on iOS via Capacitor.
 * 
 * Defaults to `false` on server/during SSR to prevent hydration mismatches.
 * Updates after mount via useEffect.
 * 
 * @returns {{ isNativeiOS: boolean, isReady: boolean }}
 */
export function useNativePlatform() {
    const [isNativeiOS, setIsNativeiOS] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const native = Capacitor.isNativePlatform();
        const ios = Capacitor.getPlatform() === "ios";
        setIsNativeiOS(native && ios);
        setIsReady(true);
    }, []);

    return { isNativeiOS, isReady };
}
