import AnalysisSection from "@/components/pages/home/analysis-section"
// import ModelPerformanceStrip from "@/components/pages/home/model-performance-strip"
import HeroSection from "@/components/pages/home/hero-section"

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <HeroSection/>

        {/* Model Performance Strip */}
        {/* <ModelPerformanceStrip /> */}

        {/* Analysis Section */}
        <AnalysisSection />
        
      </main>
    </div>
  )
}
