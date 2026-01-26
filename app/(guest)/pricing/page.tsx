import ChoosePlan from '@/components/pages/billing/choose-plan'
import React from 'react'

function Pricing() {
  return (
    <div className='min-h-screen bg-[#0b0f14] py-24 relative overflow-hidden'>
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <main className='container mx-auto max-w-6xl px-4 relative z-10'>
        <div className="text-center mb-16 space-y-6">
          <h2 className="text-primary font-medium tracking-wide uppercase text-sm">Pricing Plans</h2>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            Unleash the Power of <span className="text-primary">AI Analytics</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Start for free and upgrade when you're ready to dominate the market with advanced edge detection and parlay generation.
          </p>
        </div>

        <ChoosePlan isGuest={true} />

        <div className="mt-20 text-center">
          <p className="text-gray-500 text-sm">
            Prices are calculated in USD. VAT may apply depending on your location.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Pricing