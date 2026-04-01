"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * Global Splash Screen Animation
 * Renders an elegant full-screen overlay with a phased reveal:
 * particles → center glow → SVG network logo → MAFS text → fade out.
 */
export default function SplashScreen() {
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const duration = 2400;

  useEffect(() => {
    // Only show splash on mobile viewports (< 768px)
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    if (!mobile) {
      setVisible(false);
      return;
    }

    const t1 = setTimeout(() => setPhase(1), 50);
    const t2 = setTimeout(() => setPhase(2), 400);
    const t3 = setTimeout(() => setPhase(3), 900);
    const t4 = setTimeout(() => setPhase(4), duration - 500);
    const t5 = setTimeout(() => setVisible(false), duration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  if (!visible || !isMobile) return null;

  const nodes = [
    { x: 50, y: 8 },
    { x: 80, y: 20 },
    { x: 92, y: 50 },
    { x: 80, y: 80 },
    { x: 50, y: 92 },
    { x: 20, y: 80 },
    { x: 8, y: 50 },
    { x: 20, y: 20 },
  ];

  return (
    <div
      className={cn(
        "fixed inset-0 z-100 flex flex-col items-center justify-center bg-black"
      )}
      style={{
        opacity: phase === 4 ? 0 : 1,
        transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#64FFDA]"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              left: `${Math.random() * 100}%`,
              bottom: `-2%`,
              opacity: phase >= 1 ? 0.2 + Math.random() * 0.3 : 0,
              animation:
                phase >= 1
                  ? `float-up ${3 + Math.random() * 4}s linear ${Math.random() * 2}s infinite`
                  : "none",
              transition: "opacity 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Center glow */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(100, 255, 218, 0.08) 0%, transparent 70%)",
          opacity: phase >= 2 ? 1 : 0,
          transform: `scale(${phase >= 2 ? 1 : 0.5})`,
          transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      {/* Logo */}
      <div
        className="relative w-28 h-28 mb-6"
        style={{
          opacity: phase >= 2 ? 1 : 0,
          transform: `scale(${phase >= 2 ? 1 : 0.85})`,
          filter:
            phase >= 2
              ? "drop-shadow(0 0 25px rgba(100, 255, 218, 0.35))"
              : "none",
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64FFDA" />
              <stop offset="100%" stopColor="#4fd1c5" />
            </linearGradient>
          </defs>

          {nodes.map((node, i) => (
            <g key={i}>
              <line
                x1={node.x}
                y1={node.y}
                x2={nodes[(i + 1) % 8].x}
                y2={nodes[(i + 1) % 8].y}
                stroke="#64FFDA"
                strokeWidth="1.5"
                opacity="0.7"
              />
              <line
                x1={node.x}
                y1={node.y}
                x2={nodes[(i + 2) % 8].x}
                y2={nodes[(i + 2) % 8].y}
                stroke="#64FFDA"
                strokeWidth="0.7"
                opacity="0.35"
              />
              <line
                x1={node.x}
                y1={node.y}
                x2={50 + (node.x - 50) * 0.4}
                y2={50 + (node.y - 50) * 0.4}
                stroke="#64FFDA"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity="0.25"
              />
              <circle cx={node.x} cy={node.y} r="4" fill="url(#lg)" />
            </g>
          ))}

          <polygon
            points="50,32 62,36 68,50 62,64 50,68 38,64 32,50 38,36"
            fill="none"
            stroke="#64FFDA"
            strokeWidth="1"
            opacity="0.45"
          />
          <circle cx="50" cy="50" r="5" fill="url(#lg)" />
        </svg>
      </div>

      {/* MAFS */}
      <h1
        className="text-4xl font-bold tracking-[0.12em] mb-2"
        style={{
          color: "#64FFDA",
          opacity: phase >= 3 ? 1 : 0,
          transform: `translateY(${phase >= 3 ? 0 : 12}px)`,
          textShadow: "0 0 30px rgba(100, 255, 218, 0.4)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        MAFS
      </h1>

      {/* Tagline */}
      <p
        className="text-[10px] uppercase tracking-[0.25em] text-[#64FFDA]/50"
        style={{
          opacity: phase >= 3 ? 1 : 0,
          transform: `translateY(${phase >= 3 ? 0 : 8}px)`,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s",
        }}
      >
        Multi-Agent Fight Simulator
      </p>

      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          5% {
            opacity: 0.4;
          }
          95% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-100vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
