// lib/hooks/use-streaming-analysis.ts
import { useState, useCallback } from 'react';
import { FightEdgeSummary } from '@/types/fight-edge-summary';
import { FightBreakdownType } from '@/types/fight-breakdowns';

type FightResult = {
  type: 'fight';
  fightId: number;
  edge: FightEdgeSummary;
  breakdown: FightBreakdownType;
};

type StreamingState = {
  results: FightResult[];
  isLoading: boolean;
  isComplete: boolean;
  error: string | null;
};

export function useStreamingAnalysis() {
  const [state, setState] = useState<StreamingState>({
    results: [],
    isLoading: false,
    isComplete: false,
    error: null,
  });

  const reset = useCallback(() => {
    setState({
      results: [],
      isLoading: false,
      isComplete: false,
      error: null,
    });
  }, []);

  const startAnalysis = useCallback(async (eventData: any) => {
    setState({
      results: [],
      isLoading: true,
      isComplete: false,
      error: null,
    });

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: eventData }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);

            if (parsed.type === 'complete') {
              setState(prev => ({ 
                ...prev, 
                isComplete: true, 
                isLoading: false 
              }));
            } else if (parsed.type === 'fight') {
              setState(prev => ({
                ...prev,
                results: [...prev.results, parsed],
              }));
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  }, []);

  return { ...state, startAnalysis, reset };
}