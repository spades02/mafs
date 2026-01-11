// lib/hooks/use-streaming-analysis.ts
import { useState, useCallback } from 'react';

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
  oddsSource: string;
}

type StreamUpdate = StatusUpdate | FightResult | { type: 'complete' } | { type: 'error'; message: string };

export function useStreamingAnalysis() {
  const [results, setResults] = useState<FightResult[]>([]);
  const [totalFights, setTotalFights] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New state for tracking current phase
  const [currentPhase, setCurrentPhase] = useState<StatusPhase | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [oddsProgress, setOddsProgress] = useState({ current: 0, total: 0 });

  const startAnalysis = useCallback(async (eventData: any) => {
    setResults([]);
    setTotalFights(0);
    setIsLoading(true);
    setIsComplete(false);
    setError(null);
    setCurrentPhase(null);
    setStatusMessage('');
    setOddsProgress({ current: 0, total: 0 });

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: eventData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const update: StreamUpdate = JSON.parse(line);

            if (update.type === 'status') {
              // Update phase and status message
              setCurrentPhase(update.phase);
              setStatusMessage(update.message);
              
              // Track progress for odds fetching and fight analysis
              if (update.progress) {
                if (update.phase === 'fetching_odds') {
                  setOddsProgress(update.progress);
                  setTotalFights(update.progress.total);
                } else if (update.phase === 'analyzing_fight') {
                  // Total is already set from odds fetching
                }
              }
              
            } else if (update.type === 'fight') {
              setResults(prev => [...prev, update]);
              
              // Set total fights if not set yet
              if (totalFights === 0) {
                // We can infer total from the event data
                // This is a fallback in case status updates didn't provide it
              }
              
            } else if (update.type === 'complete') {
              setIsComplete(true);
              setIsLoading(false);
              setCurrentPhase(null);
              
            } else if (update.type === 'error') {
              setError(update.message);
              setIsLoading(false);
              setCurrentPhase(null);
            }
          } catch (e) {
            console.error('Failed to parse stream update:', line, e);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
      setIsLoading(false);
      setCurrentPhase(null);
    }
  }, [totalFights]);

  const reset = useCallback(() => {
    setResults([]);
    setTotalFights(0);
    setIsLoading(false);
    setIsComplete(false);
    setError(null);
    setCurrentPhase(null);
    setStatusMessage('');
    setOddsProgress({ current: 0, total: 0 });
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
    startAnalysis,
    reset,
  };
}