import { auth } from "@/app/lib/auth/auth"
import { headers } from "next/headers"
import HeroSection from "@/components/pages/home/hero-section"
import LiveStatsBanner from "@/components/pages/home/live-stats-banner"
import MarketEdgeRadar from "@/components/pages/home/market-edge-radar"
import EdgePreview from "@/components/pages/home/edge-preview"
import WhyMafsSection from "@/components/pages/home/why-mafs-section"
import HowItWorksSection from "@/components/pages/home/how-it-works-section"
import TrackRecord from "@/components/pages/home/track-record"
import FeaturesSection from "@/components/pages/home/features-section"
import Testimonials from "@/components/pages/home/testimonials"
import PricingSection from "@/components/pages/home/pricing-section"
import FinalCTA from "@/components/pages/home/final-cta"
import LandingFooter from "@/components/pages/home/landing-footer"

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const isAuthenticated = !!session?.user
  const isPro = session?.user?.isPro || false

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background grid patterns */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,255,218,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,255,218,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-[0.06]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,255,218,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,255,218,0.02)_1px,transparent_1px)] bg-[size:9rem_9rem] opacity-[0.04]" />

        {/* Radar scan lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[rgba(100,255,218,0.15)] to-transparent radar-scan-horizontal" />
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[rgba(100,255,218,0.08)] to-transparent radar-scan-horizontal-slow" />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(100,255,218,0.04),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.15)_100%)]" />
        </div>
      </div>

      {/* Top hero glow */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/8 blur-[100px] rounded-full pointer-events-none opacity-60" />

      {/* Content */}
      <div className="relative">
        <HeroSection isPro={isPro} isAuthenticated={isAuthenticated} />
        <LiveStatsBanner />
        <MarketEdgeRadar isPro={isPro} />
        <EdgePreview isPro={isPro} />
        {!isAuthenticated && <WhyMafsSection />}
        <HowItWorksSection />
        <TrackRecord />
        <FeaturesSection />
        {!isAuthenticated && <Testimonials />}
        {!isPro && <PricingSection isAuthenticated={isAuthenticated} />}
        <FinalCTA isPro={isPro} isAuthenticated={isAuthenticated} />
        <LandingFooter />
      </div>
    </div>
  )
}
