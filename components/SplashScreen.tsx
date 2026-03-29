"use client";

import { useEffect, useState } from "react";
import Logo from "./shared/logo";

/**
 * Global Splash Screen Animation
 * Renders an elegant full-screen overlay on initial app load,
 * holds for a moment, and fades out cleanly.
 */
export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Completely unmount after 2.2s (matching the CSS animation duration)
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2200);

    return () => {
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-atmosphere pointer-events-none overflow-hidden">
      {/* Background Particles from existing CSS pattern */}
      <div className="absolute inset-0 z-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              /* Negative delay means the animation starts immediately but as if it had been running 
                 for that many seconds, which randomly distributes them vertically across the screen */
              animationDelay: `-${Math.random() * 15}s`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center justify-center h-full w-full">
        {/* Glowing backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] animate-pulse" />

        {/* Main Icon/Logo with custom animation */}
        <div className="relative z-10 flex flex-col items-center animate-splash-logo">
          <Logo width={320} height={320} />
        </div>
      </div>
    </div>
  );
}
