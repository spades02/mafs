// lib/hooks/use-streaming-analysis.ts
import { useState, useCallback } from 'react';
import { FightEdgeSummary } from '@/types/fight-edge-summary';
import { FightBreakdownType } from '@/types/fight-breakdowns';

export type FightResult = {
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
  totalFights: number;  // add totalFights
};

export function useStreamingAnalysis() {
  const [state, setState] = useState<StreamingState>({
    results: [],
    isLoading: false,
    isComplete: false,
    error: null,
    totalFights: 0,
  });

  const reset = useCallback(() => {
    setState({
      results: [],
      isLoading: false,
      isComplete: false,
      error: null,
      totalFights: 0,
    });
  }, []);

  const startAnalysis = useCallback(async (eventData: any) => {
    setState({
      results: [],
      isLoading: true,
      isComplete: false,
      error: null,
      totalFights: 0,
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

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);

            if (parsed.type === 'complete') {
              setState(prev => ({
                ...prev,
                isComplete: true,
                isLoading: false,
              }));
            } else if (parsed.type === 'fight') {
              setState(prev => ({
                ...prev,
                results: [...prev.results, parsed],
                totalFights: prev.totalFights, // update totalFights if sent from backend
              }));
            }
          } catch (e) {
            console.error('Parse error:', e, line);
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
