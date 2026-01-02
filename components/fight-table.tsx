import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { FightEdgeSummaryWithFightId } from '@/types/fight-edge-summary';
import FightTableSkeleton from './skeletons/fight-table-skeleton';

type FightTableProps = {
  fightData: FightEdgeSummaryWithFightId[];
  onSelectFight: (id: number) => void;
  isLoading?: boolean;
  isComplete?: boolean;
};

function FightTable({
  fightData,
  onSelectFight,
  isLoading = false,
  isComplete = false,
}: FightTableProps) {
  const hasData = fightData && fightData.length > 0;
  const showSkeletonRow = isLoading && !isComplete;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>
          Fight Table – Mispriced Fights
          <span className='font-light text-xs'> (Click on any fight to see MAFS AI breakdown below this table)</span>
          </CardTitle>
      </CardHeader>

      {/* Show full skeleton only if no data at all */}
      {!hasData && isLoading && (
        <FightTableSkeleton />
      )}

      {/* Show table with progressive rows */}
      {hasData && (
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Fight</th>
                  <th className="pb-3 pr-4 font-medium">MAFS Score</th>
                  <th className="pb-3 pr-4 font-medium">Best Bet</th>
                  <th className="pb-3 pr-4 font-medium">EV %</th>
                  <th className="pb-3 pr-4 font-medium">Confidence</th>
                  <th className="pb-3 pr-4 font-medium">Risk</th>
                  <th className="pb-3 pr-4 font-medium">Value Tier</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {/* Render completed fights with animation */}
                {fightData
                  .filter((fight) => fight.ev !== 0)
                  .map((fight, index) => (
                    <tr
                      key={`${fight.id}-${index}`}
                      onClick={() => onSelectFight(fight.fightId)}
                      className="cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/50 animate-in fade-in slide-in-from-left-2"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-4 pr-4 font-medium">{fight.fight}</td>
                      <td className="py-4 pr-4">
                        <span className="font-bold text-primary">{fight.score}</span>
                      </td>
                      <td className="py-4 pr-4">{fight.bet}</td>
                      <td className="py-4 pr-4 font-semibold text-primary">{fight.ev}%</td>
                      <td className="py-4 pr-4">{fight.confidence}%</td>
                      <td className="py-4 pr-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            fight.risk <= 50
                              ? "bg-green-500/20 text-green-400"
                              : fight.risk > 50 && fight.risk < 78
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {fight.risk}%
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                          {fight.tier}
                        </span>
                      </td>
                    </tr>
                  ))}

                {/* Show loading row while analyzing more fights */}
                {showSkeletonRow && (
                  <tr className="border-b border-border/50 animate-pulse">
                    <td className="py-4 pr-4" colSpan={7}>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                        <span className="text-xs text-muted-foreground">
                          Analyzing next fight...
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}

      {/* Show message when complete */}
      {isComplete && hasData && (
        <CardContent className="pt-0">
          <p className="text-xs text-center text-primary">
            ✅ All fights analyzed
          </p>
        </CardContent>
      )}

      {/* Show empty state if complete but no data */}
      {isComplete && !hasData && (
        <CardContent>
          <p className="text-sm text-center text-muted-foreground py-8">
            No mispriced fights found for this event.
          </p>
        </CardContent>
      )}
    </Card>
  );
}

export default FightTable;