import { auth } from "@/app/lib/auth/auth"
import { headers } from "next/headers"
import ScanningBar from "@/components/pages/home/scanning-bar"
import HeroSection from "@/components/pages/home/hero-section"
import EdgeTicker from "@/components/pages/home/edge-ticker"
import LiveStatsBanner from "@/components/pages/home/live-stats-banner"

import HowItWorksSection from "@/components/pages/home/how-it-works-section"
import TrackRecord from "@/components/pages/home/track-record"
import FeaturesSection from "@/components/pages/home/features-section"
import Testimonials from "@/components/pages/home/testimonials"
import PricingSection from "@/components/pages/home/pricing-section"
import FinalCTA from "@/components/pages/home/final-cta"
import LandingFooter from "@/components/pages/home/landing-footer"
import { RadarParticles } from "@/components/radar-particles"
import RecentEdgeFeed from "@/components/pages/home/recent-edge-feed"
import RiskReversal from "@/components/pages/home/risk-reversal"
import WhyMostLoseSection from "@/components/pages/home/why-most-lose-section"
import { getLandingPageData } from "@/app/actions/landing-page-actions"

export const revalidate = 60; // 60 seconds ISR caching

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const landingData = await getLandingPageData()

  const isAuthenticated = !!session?.user
  const isPro = session?.user?.isPro || false

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <RadarParticles />

      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/8 blur-[100px] rounded-full pointer-events-none opacity-60" />

      <div className="relative">
        <ScanningBar />
        <HeroSection
          isPro={isPro}
          isAuthenticated={isAuthenticated}
          stats={landingData.stats}
          trackRecordSummary={landingData.trackRecordSummary}
          liveEdgeCount={landingData.liveEdgeCount}
          featuredFight={landingData.featuredFight}
          topEdges={landingData.topEdges}
        />
        <EdgeTicker tickerEdges={landingData.topEdges} />
        <LiveStatsBanner
          stats={landingData.stats}
          trackRecordSummary={landingData.trackRecordSummary}
        />
        <RecentEdgeFeed recentEdges={landingData.topEdges.slice(0, 5)} isPro={isPro} />
        {!isAuthenticated && <WhyMostLoseSection />}
        <HowItWorksSection
          featuredFight={landingData.featuredFight}
          sharpMoney={landingData.sharpMoney}
        />
        <TrackRecord
          pastResults={landingData.pastResults}
          summary={landingData.trackRecordSummary}
        />
        <FeaturesSection />
        {!isAuthenticated && <Testimonials />}
        {!isPro && <PricingSection isAuthenticated={isAuthenticated} />}
        {!isPro && <RiskReversal />}
        <FinalCTA
          isPro={isPro}
          isAuthenticated={isAuthenticated}
          liveEdgeCount={landingData.liveEdgeCount}
        />
        <LandingFooter />
      </div>
    </div>
  )
}
