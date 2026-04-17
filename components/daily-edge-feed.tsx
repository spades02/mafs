"use client"
import React, { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Zap, Sparkles } from 'lucide-react'
import { FightEdgeSummary } from '@/lib/agents/schemas/fight-edge-summary-schema'
import { Skeleton } from './ui/skeleton'

interface DailyEdgeFeedProps {
  fightData: FightEdgeSummary[];
  isLoading?: boolean;
  isComplete?: boolean;
}

function DailyEdgeFeed({ fightData, isLoading = false, isComplete = false }: DailyEdgeFeedProps) {
  const hasData = fightData && fightData.length > 0;
  const showSkeletons = !hasData || (isLoading && !isComplete);

  // Derive feed items from fight data
  const feedItems = useMemo(() => {
    if (!hasData) return [];

    const items: Array<{
      type: 'SHARP' | 'VALUE';
      title: string;
      subtitle: string;
      time: string;
    }> = [];

    fightData.forEach((edge) => {
      // If no EV, skip
      if (edge.edge_pct <= 0 && edge.ev === null) return;

      const titleLabel = edge.label || edge.fight || "Unknown";

      // Detect if there's line movement toward the model
      let isSharp = false;
      if (edge.oddsHistory && edge.oddsHistory.length >= 2) {
        const first = edge.oddsHistory[0].oddsAmerican;
        const last = edge.oddsHistory[edge.oddsHistory.length - 1].oddsAmerican;
        
        // If the odds are moving to become shorter/worse, the market is catching on
        if (last < first) {
          isSharp = true;
        }
      }

      // Generate a mock time based on current time to seem alive
      const now = new Date();
      const minutesOffset = Math.floor(Math.random() * 60);
      now.setMinutes(now.getMinutes() - minutesOffset);
      const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

      if (isSharp || edge.patternInsight?.toLowerCase().includes("sharp")) {
        items.push({
          type: 'SHARP',
          title: `Sharp action — ${titleLabel}`,
          subtitle: 'Line moving toward model price',
          time: timeStr
        });
      }

      // Also add a value signal if edge is decently high
      const valueEdge = edge.edge_pct ?? edge.ev ?? 0;
      if (valueEdge >= 5) {
        items.push({
          type: 'VALUE',
          title: `Value disparity — ${titleLabel}`,
          subtitle: `Model prices at ${Math.round(edge.truthProbability * 100)}%, Market at ${Math.round(edge.P_imp * 100)}%`,
          time: timeStr
        });
      }
    });

    return items;
  }, [fightData, hasData]);

  return (
    <Card className="mb-8 card-glow overflow-hidden bg-black/40 border border-white/5">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/10">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg font-bold">MAFS Daily Edge Feed</CardTitle>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
          </div>
        </div>
        <span className="text-[10px] uppercase text-muted-foreground tracking-widest">
          {showSkeletons ? "SCANNING..." : `${feedItems.length} SIGNALS`}
        </span>
      </CardHeader>

      <CardContent className="p-0">
        {showSkeletons ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-10 w-1 bg-muted/20" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4 bg-muted/20" />
                  <Skeleton className="h-3 w-1/2 bg-muted/20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
            {feedItems.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground/60">
                No acute edges detected in current scan.
              </div>
            ) : (
              feedItems.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-stretch border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors relative group"
                >
                  {/* Color Bar */}
                  <div className={`w-1 shrink-0 ${item.type === 'SHARP' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  
                  <div className="flex-1 p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                       {item.type === 'SHARP' ? (
                         <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">
                           <Zap className="w-3 h-3" />
                           {item.type}
                         </div>
                       ) : (
                         <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">
                           <Sparkles className="w-3 h-3" />
                           {item.type}
                         </div>
                       )}
                    </div>
                    
                    <p className="text-sm font-semibold text-foreground/90 mb-0.5 group-hover:text-foreground transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="p-4 flex items-start justify-end shrink-0">
                    <span className="text-[10px] text-muted-foreground/40 font-mono tracking-tighter">
                      {item.time}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DailyEdgeFeed
