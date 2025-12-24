import CTAButtons from "@/components/pages/home/cta-buttons"
import HeroSection from "@/components/pages/home/hero-section"

export default function Page() {
  return (
    <div className="max-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <HeroSection/>
        {/* Call to action buttons */}
        <CTAButtons />
      </main>
    </div>
  )
}
