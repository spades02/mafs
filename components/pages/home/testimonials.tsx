import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    quote: "MAFS changed how I approach MMA betting. The edge detection is legitimately finding mispriced lines before the market corrects.",
    author: "Marcus T.",
    initials: "MT",
    role: "Professional Bettor",
    result: "+$24,500 this year",
  },
  {
    quote: "The multi-agent simulation approach is brilliant. Instead of one model, you get consensus from 8 different analytical perspectives.",
    author: "Jake R.",
    initials: "JR",
    role: "Sports Analytics",
    result: "67% hit rate",
  },
  {
    quote: "Finally, a tool that explains WHY a bet has value, not just tells me to bet it. The transparency is refreshing.",
    author: "David K.",
    initials: "DK",
    role: "Recreational Bettor",
    result: "+12% ROI",
  },
]

function Testimonials() {
  return (
    <section className="py-20 md:py-28 px-4 bg-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Testimonials</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance">
            Trusted by serious bettors
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card key={i} className="glass-card border-border/50">
              <CardContent className="p-6">
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground mb-6 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-medium">{t.author}</p>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {t.result}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
