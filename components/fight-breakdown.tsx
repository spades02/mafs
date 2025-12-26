import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FightBreakdownType } from "@/types/fight-breakdowns";

type FightBreakdownProps = {
  currentFightData: FightBreakdownType;
};

function FightBreakdown({ currentFightData }: FightBreakdownProps) {
  // fallback safe values
  const trueLine = currentFightData.trueLine ?? { fighter: "—", odds: "—", prob: "—" };
  const marketLine = currentFightData.marketLine ?? { fighter: "—", odds: "—", prob: "—" };
  const pathToVictory = currentFightData.pathToVictory ?? [];
  const whyLineExists = currentFightData.whyLineExists ?? [];
  const fighter1Notes = currentFightData.fighter1?.notes ?? [];
  const fighter2Notes = currentFightData.fighter2?.notes ?? [];

  return (
    <Card className="mb-8 card-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Fight Breakdown: {currentFightData.fight ?? "—"}</CardTitle>
          {/* <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button> */}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/20 px-3 py-1 text-sm font-semibold text-primary">
            {currentFightData.edge ?? "—"}
          </span>
          <span className="text-sm text-muted-foreground">
            {currentFightData.ev ?? "—"} EV • {currentFightData.score ?? "—"} MAFS Score
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* True Line vs Market Line */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            True Line vs Market Line
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="mb-1 text-xs text-muted-foreground">True Line (Model)</div>
                <div className="text-xl font-bold text-primary">
                  {trueLine.fighter} {trueLine.odds}
                </div>
                <div className="text-sm text-muted-foreground">
                  {trueLine.prob} implied probability
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="mb-1 text-xs text-muted-foreground">Market Line (Books)</div>
                <div className="text-xl font-bold">{marketLine.fighter} {marketLine.odds}</div>
                <div className="text-sm text-muted-foreground">{marketLine.prob} implied probability</div>
              </CardContent>
            </Card>
          </div>

          <p className="mt-3 text-sm text-primary">
            Mispricing gap: <span className="font-bold">+{currentFightData.mispricing ?? "—"} EV points</span>
          </p>
        </div>

        {/* Recommended Play */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recommended Play
          </h3>
          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="p-4">
              <div className="mb-2 text-xs font-semibold text-muted-foreground">Best Bet for This Fight</div>
              <div className="mb-3 text-2xl font-bold text-primary">
                {currentFightData.recommendedBet ?? "—"}
              </div>

              <div className="mb-3 flex gap-4 text-sm">
                <span>
                  <span className="font-semibold text-primary">{currentFightData.betEv ?? "—"} EV</span>
                </span>
                <span>
                  <span className="font-semibold">{currentFightData.confidence ?? "—"} confidence</span>
                </span>

                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    (currentFightData.risk ?? "").toString() === "Low"
                      ? "bg-green-500/20 text-green-400"
                      : (currentFightData.risk ?? "").toString() === "Medium"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {currentFightData.risk ?? "—"} Risk
                </span>
              </div>

              {currentFightData.stake === 0 ? (
                <p className="text-sm font-semibold text-muted-foreground">Suggested stake: Pass — edge too small</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Suggested stake: <span className="font-semibold">{currentFightData.stake} units</span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Style Matchup Notes */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Style Matchup Notes
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 font-semibold">{currentFightData.fighter1?.name ?? "—"}</div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {fighter1Notes.map((note, idx) => (
                  <li key={`fighter1-note-${idx}`}>• {note}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="mb-2 font-semibold">{currentFightData.fighter2?.name ?? "—"}</div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {fighter2Notes.map((note, idx) => (
                  <li key={`fighter2-note-${idx}`}>• {note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Path to Victory */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Path-to-Victory Snapshot
          </h3>
          <ol className="space-y-2 text-sm">
            {pathToVictory.map((item: any, idx: number) => (
              <li key={`path-${idx}`}>
                <span className="font-semibold text-primary">#{idx + 1}</span> – {item.path}{" "}
                <span className="text-muted-foreground">({item.prob})</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Why This Line Exists */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Why This Line Exists
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {whyLineExists.map((reason: string, idx: number) => (
              <li key={`reason-${idx}`}>• {reason}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default FightBreakdown;
