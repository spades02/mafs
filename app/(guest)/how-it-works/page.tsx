import Logo from "@/components/shared/logo";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "What is MAFS?",
  description:
    "MAFS is a data-driven MMA fight analysis system designed to give bettors a measurable edge over the market.",
};

export default function MAFSPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      {/* Hero */}
      <section className="mb-20 text-center">
        <div className="flex gap-2 justify-center">
          <Logo height={100} width={100} />
          <h1 className="text-4xl mt-2 font-bold tracking-tight sm:text-5xl">
            MAFS
          </h1>
        </div>
        <p className="mt-6 text-lg text-muted-foreground">
          A professional MMA fight analysis system built to identify
          mispriced betting opportunities and long-term market edges.
        </p>
      </section>

      {/* What is MAFS */}
      <section className="mb-16">
        <h2 className="mb-4 text-2xl font-semibold">
          What is MAFS?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          MAFS is a structured MMA analytics platform that evaluates UFC
          fights using quantitative models, matchup dynamics, and market
          comparison. Instead of relying on narratives, hype, or gut
          feeling, MAFS focuses on identifying where bookmaker odds do not
          accurately reflect a fighter’s true probability of winning.
        </p>
      </section>

      {/* How it Works */}
      <section className="mb-16">
        <h2 className="mb-8 text-2xl font-semibold">
          How MAFS Works
        </h2>

        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-2 font-medium">1. Fight Modeling</h3>
              <p className="text-sm text-muted-foreground">
                Each matchup is analyzed using historical performance,
                stylistic factors, physical attributes, and contextual
                variables to estimate true win probabilities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-2 font-medium">2. Market Comparison</h3>
              <p className="text-sm text-muted-foreground">
                MAFS compares internally calculated probabilities against
                sportsbook odds to identify discrepancies and pricing
                inefficiencies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-2 font-medium">3. Edge Identification</h3>
              <p className="text-sm text-muted-foreground">
                Only bets with a measurable statistical edge and positive
                expected value are surfaced to users.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Metrics */}
      <section className="mb-16">
        <h2 className="mb-8 text-2xl font-semibold">
          Understanding the Metrics
        </h2>

        <div className="space-y-4 text-muted-foreground">
          <p>
            <strong>True Line:</strong> MAFS’s internal fair odds based on
            calculated win probability, independent of the market.
          </p>
          <p>
            <strong>Market Line:</strong> The current sportsbook odds
            available to bettors.
          </p>
          <p>
            <strong>Edge:</strong> The percentage difference between the
            true probability and the implied market probability.
          </p>
          <p>
            <strong>Expected Value (EV):</strong> The long-term profitability
            of a bet if placed repeatedly under the same conditions.
          </p>
          <p>
            <strong>Mispricing:</strong> A clear deviation where the market
            undervalues or overvalues a fighter relative to MAFS’s model.
          </p>
        </div>
      </section>

      {/* How to Use */}
      <section className="mb-16">
        <h2 className="mb-4 text-2xl font-semibold">
          How to Use MAFS Effectively
        </h2>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>Focus on long-term consistency, not single-fight outcomes.</li>
          <li>Prioritize bets with strong edge and positive EV.</li>
          <li>Avoid emotional or narrative-based betting.</li>
          <li>Use disciplined bankroll management.</li>
          <li>Understand that variance is unavoidable in short samples.</li>
        </ul>
      </section>

      {/* Who It's For */}
      <section className="mb-16">
        <h2 className="mb-4 text-2xl font-semibold">
          Who MAFS Is For
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          MAFS is built for bettors who treat betting as a probabilistic,
          data-driven process. It is not designed for casual gambling or
          entertainment-based picks, but for users seeking sustainable,
          analytical decision-making.
        </p>
      </section>

      {/* Disclaimer */}
      <section className="border-t pt-8 text-sm text-muted-foreground">
        <p>
          Disclaimer: MAFS provides analytical insights, not guarantees.
          Sports betting involves risk, and no system can eliminate variance
          or uncertainty. Users are responsible for their own decisions.
        </p>
      </section>
    </main>
  );
}
