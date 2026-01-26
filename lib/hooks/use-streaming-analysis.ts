// lib/hooks/use-streaming-analysis.ts
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type StatusPhase = 'fetching_odds' | 'analyzing_card' | 'analyzing_fight';

interface StatusUpdate {
  type: 'status';
  phase: StatusPhase;
  message: string;
  progress?: {
    current: number;
    total: number;
  };
}

interface FightResult {
  type: 'fight';
  fightId: number;
  edge: any;
  breakdown: any;
  oddsSource?: string;
}

interface FightErrorUpdate {
  type: 'fight_error';
  fightId: number;
  matchup: string;
  message: string;
}

type StreamUpdate =
  | StatusUpdate
  | FightResult
  | FightErrorUpdate
  | { type: 'complete' }
  | { type: 'error'; message: string };

export function useStreamingAnalysis() {
  const router = useRouter();
  const [results, setResults] = useState<FightResult[]>([]);
  const [totalFights, setTotalFights] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPhase, setCurrentPhase] = useState<StatusPhase | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [oddsProgress, setOddsProgress] = useState({ current: 0, total: 0 });
  const [fightErrors, setFightErrors] = useState<FightErrorUpdate[]>([]);

  const startAnalysis = useCallback(async (eventData: any) => {
    setResults([]);
    setTotalFights(0);
    setIsLoading(true);
    setIsComplete(false);
    setError(null);
    setCurrentPhase(null);
    setStatusMessage('');
    setOddsProgress({ current: 0, total: 0 });
    setFightErrors([]);

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: eventData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream reader');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by DOUBLE newline
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const event of events) {
          const line = event
            .split('\n')
            .find(l => l.startsWith('data:'));

          if (!line) continue;

          const json = line.replace(/^data:\s*/, '');

          try {
            const update: StreamUpdate = JSON.parse(json);

            if (update.type === 'status') {
              setCurrentPhase(update.phase);
              setStatusMessage(update.message);

              if (update.progress) {
                setOddsProgress(update.progress);
                setTotalFights(update.progress.total);
              }
            }

            if (update.type === 'fight') {
              setResults(prev => [...prev, update]);
            }

            if (update.type === 'complete') {
              setIsComplete(true);
              setIsLoading(false);
              setCurrentPhase(null);
              toast.success("Analysis saved to history");
              router.refresh();
            }

            if (update.type === 'error') {
              setError(update.message);
              setIsLoading(false);
              setCurrentPhase(null);
            }

            // Handle individual fight errors
            if (update.type === 'fight_error') {
              setFightErrors(prev => [...prev, update]);
            }
          } catch (err) {
            console.error('SSE parse error:', json);
          }
        }
      }
    } catch (err: any) {
      setError(err.message ?? 'Analysis failed');
      setIsLoading(false);
      setCurrentPhase(null);
    }
  }, []);

  const reset = useCallback(() => {
    setResults([]);
    setTotalFights(0);
    setIsLoading(false);
    setIsComplete(false);
    setError(null);
    setCurrentPhase(null);
    setStatusMessage('');
    setOddsProgress({ current: 0, total: 0 });
    setFightErrors([]);
  }, []);

  return {
    results,
    totalFights,
    isLoading,
    isComplete,
    error,
    currentPhase,
    statusMessage,
    oddsProgress,
    fightErrors,
    startAnalysis,
    reset,
  };
}
