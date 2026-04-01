const typicalAdvice = [
  "Twitter picks",
  "Gut feelings",
  "Fighter hype",
  "Narrative-driven analysis",
]

const mafsIntelligence = [
  "Multi-agent fight simulation",
  "Statistical modeling",
  "Market inefficiency detection",
  "Quantified betting edges",
]

function WhyMafsSection() {
  return (
    <section className="py-16 md:py-20 px-4 bg-muted/20 border-y border-border/50">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Why MAFS Beats Human Picks
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Typical Advice */}
          <div className="p-6 rounded-xl bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-muted-foreground">Typical Betting Advice</h3>
            </div>
            <ul className="space-y-3">
              {typicalAdvice.map((item) => (
                <li key={item} className="flex items-center gap-3 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* MAFS Intelligence */}
          <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-primary">MAFS Intelligence</h3>
            </div>
            <ul className="space-y-3">
              {mafsIntelligence.map((item) => (
                <li key={item} className="flex items-center gap-3 text-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-center mt-8 text-muted-foreground font-medium">
          Only bets with <span className="text-primary">real mathematical edge</span> pass the system.
        </p>
      </div>
    </section>
  )
}

export default WhyMafsSection
