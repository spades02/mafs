import React from 'react'

function HeroSection() {
  return (
    <div className="mb-12 text-center hero-glow">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/20 p-3">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <circle cx="12" cy="12" r="6" strokeWidth="2" />
                <circle cx="12" cy="12" r="2" strokeWidth="2" fill="currentColor" />
              </svg>
            </div>
          </div>
          <h1 className="mb-3 text-4xl font-bold text-balance">Find the truth behind the odds.</h1>
          <p className="mb-4 text-lg text-muted-foreground text-balance">
            MAFS doesn't predict winners — it finds mispriced lines and gives you the most profitable bets.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-primary">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span>AI is live — scanning UFC markets for mispriced lines in real time…</span>
          </div>
        </div>
  )
}

export default HeroSection