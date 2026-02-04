import CTAButtons from "@/components/pages/home/cta-buttons"
import HeroSection from "@/components/pages/home/hero-section"

export default function Page() {
  return (
    <div className="premium-bg overflow-hidden neural-bg font-sans selection:bg-primary/30 relative">
      <div className="hero-orb" />
      <div className="hero-orb-secondary" />
      <div className="scanlines" />

      {/* Particles */}
      <div className="particle" style={{ left: "10%", animationDelay: "0s" }} />
      <div className="particle" style={{ left: "20%", animationDelay: "2s" }} />
      <div className="particle" style={{ left: "35%", animationDelay: "4s" }} />
      <div className="particle" style={{ left: "55%", animationDelay: "1s" }} />
      <div className="particle" style={{ left: "70%", animationDelay: "3s" }} />
      <div className="particle" style={{ left: "85%", animationDelay: "5s" }} />

      <main className="container mx-auto px-4 relative z-10 flex flex-col justify-center min-h-[calc(100vh-65px)]">
        {/* Hero Section */}
        <HeroSection />
        {/* Call to action buttons */}
        <CTAButtons />
      </main>
    </div>
  )
}
