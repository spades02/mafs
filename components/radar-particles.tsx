"use client"

/**
 * RadarParticles – Faltu
 * Decorative background layer with radar-style scanning effects,
 * glowing dots that pulse in/out, and subtle rising particles.
 * Renders as a fixed overlay behind all page content.
 */

const DOT_POSITIONS = [
  { top: "15%", left: "10%", delay: "0s", duration: "8s" },
  { top: "25%", left: "85%", delay: "2s", duration: "10s" },
  { top: "60%", left: "75%", delay: "1s", duration: "11s" },
  { top: "35%", left: "60%", delay: "5s", duration: "12s" },
]

const RISING_PARTICLES = Array.from({ length: 4 }, (_, i) => ({
  left: `${15 + i * 20}%`,
  duration: `${20 + i * 2}s`,
  delay: `${i * 1.5}s`,
}))

export function RadarParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Fine grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,255,218,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,255,218,0.03)_1px,transparent_1px)] bg-size-[3rem_3rem] opacity-[0.06]" />

      {/* Coarse grid for depth */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,255,218,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,255,218,0.02)_1px,transparent_1px)] bg-size-[9rem_9rem] opacity-[0.04]" />

      {/* Removed heavy horizontal scan lines to prevent UI lag */}

      {/* Pulsing dots scattered across the page */}
      <div className="absolute inset-0">
        {DOT_POSITIONS.map((dot, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30 animate-pulse"
            style={{
              top: dot.top,
              left: dot.left,
              animationDelay: dot.delay,
              animationDuration: dot.duration,
            }}
          />
        ))}
      </div>

      {/* Rising particles */}
      <div className="absolute inset-0 overflow-hidden opacity-50">
        {RISING_PARTICLES.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: p.left,
              animationDelay: `-${i * 2}s`,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* Radial gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(100,255,218,0.04),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.15)_100%)]" />
    </div>
  )
}
