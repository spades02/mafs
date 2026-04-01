import {
  Activity,
  DollarSign,
  Search,
  ScanLine,
  TrendingUp,
  ShieldCheck,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Activity,
    title: "Fight Simulation Engine",
    description: "8 specialized AI agents independently simulate every UFC fight from different analytical angles.",
  },
  {
    icon: DollarSign,
    title: "Sharp Money Tracker",
    description: "Real-time tracking of professional betting action. Know where the smart money is moving.",
  },
  {
    icon: Search,
    title: "Edge Detection System",
    description: "Continuous scanning of 27+ sportsbooks to surface mispriced lines as they appear.",
  },
  {
    icon: ScanLine,
    title: "Market Line Scanner",
    description: "Live odds comparison across all major books. Never miss the best line again.",
  },
  {
    icon: TrendingUp,
    title: "CLV Edge Tracking",
    description: "Track closing line value to measure your true edge against market efficiency.",
  },
  {
    icon: ShieldCheck,
    title: "Risk-Adjusted Picks",
    description: "Every bet includes confidence scores, variance tags, and clear risk profiles.",
  },
]

function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Features</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">
            Professional-grade tools
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Everything you need to find value the market hasn&apos;t priced in yet.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="feature-card group">
              <CardContent className="p-6">
                <div className="feature-icon h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
