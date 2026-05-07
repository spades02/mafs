"use client";

import { useEffect, useRef } from "react";

/**
 * Registers this device for APNs push when running inside the Capacitor
 * iOS app. No-op on web. Calls /api/push/register with the token after
 * Apple returns it.
 *
 * Idempotent — safe to mount on every dashboard load. Server upserts.
 *
 * Lazy-imports @capacitor/core and @capacitor/push-notifications so the
 * Next bundle stays clean for web users (Capacitor isn't available there).
 */
export function usePushRegistration({ optedIn }: { optedIn: boolean }) {
  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;
    if (!optedIn) return;

    let cancelled = false;

    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return; // web — no APNs

        const mod = await import("@capacitor/push-notifications");
        const PushNotifications = mod.PushNotifications;

        // Ask for permission — on iOS this triggers the system prompt the
        // first time. Subsequent calls return the cached state.
        const perm = await PushNotifications.requestPermissions();
        if (perm.receive !== "granted") return;

        await PushNotifications.register();

        // Token comes back via the `registration` event.
        const handle = await PushNotifications.addListener("registration", async (token) => {
          if (cancelled) return;
          try {
            await fetch("/api/push/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: token.value, platform: "apns" }),
            });
          } catch (err) {
            console.error("[push] failed to register token with server:", err);
          }
        });

        await PushNotifications.addListener("registrationError", (err) => {
          console.error("[push] APNs registrationError:", err);
        });

        // Best-effort cleanup on unmount — Capacitor listeners persist
        // across remounts, but we'd leak handlers in dev hot-reload otherwise.
        return () => {
          cancelled = true;
          handle.remove().catch(() => {});
        };
      } catch (err) {
        console.error("[push] registration flow failed:", err);
      }
    })();
  }, [optedIn]);
}
