"use client";

import { useEffect, useState } from "react";

interface AnalysisProgressProps {
  progress: number;
  processed: number;
  total: number;
  isComplete: boolean;
  currentPhase?: 'fetching_odds' | 'analyzing_card' | 'analyzing_fight' | null;
  statusMessage?: string;
}

export default function AnalysisProgress({
  progress,
  processed,
  total,
  isComplete,
  currentPhase,
  statusMessage,
}: AnalysisProgressProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (isComplete) return null;

  // Detect states
  const isIndeterminate = total === 0 && processed > 0;
  const isStarting = total === 0 && processed === 0;

  // Safe percentage calculation
  const percentage = isIndeterminate ? 100 : Math.min(100, Math.max(0, total > 0 ? progress : 0));

  // Smart Status Text - Now uses phase and custom message
  let statusText = "";
  let subtitle = "Processing market edges and fight breakdowns";

  if (statusMessage) {
    // Use custom status message if provided
    statusText = statusMessage;
  } else if (isStarting) {
    statusText = "Initializing engine";
  } else if (currentPhase === 'fetching_odds') {
    statusText = isIndeterminate 
      ? `Fetching live odds` 
      : `Fetching live odds (${processed}/${total})`;
    subtitle = "Retrieving current betting lines from sportsbooks";
  } else if (currentPhase === 'analyzing_card') {
    statusText = "Analyzing card holistically";
    subtitle = "Evaluating competitive landscape and market inefficiencies";
  } else if (currentPhase === 'analyzing_fight') {
    statusText = isIndeterminate
      ? `Analyzing fight ${processed + 1}`
      : `Analyzing fight ${processed + 1} of ${total}`;
    subtitle = "Processing market edges and fight breakdowns";
  } else {
    // Fallback to old behavior
    statusText = isIndeterminate
      ? `Analyzing fight ${processed + 1}`
      : `Analyzing fight ${processed + 1} of ${total}`;
  }

  return (
    <div className="mb-8 w-full max-w-2xl mx-auto space-y-3">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {statusText}{dots}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </span>
        </div>
        
        {/* Only show percentage if we know the total and not in card analysis */}
        {!isIndeterminate && !isStarting && currentPhase !== 'analyzing_card' && (
          <div className="text-sm font-bold text-primary">
            {Math.round(percentage)}%
          </div>
        )}
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/50 border border-border">
        <div
          className={`h-full bg-primary transition-all duration-500 ease-out relative overflow-hidden ${
            isIndeterminate || currentPhase === 'analyzing_card' ? "animate-pulse" : ""
          }`}
          style={{ 
            width: currentPhase === 'analyzing_card' ? '100%' : `${percentage}%` 
          }}
        >
          {/* Animation Logic */}
          {(isIndeterminate || currentPhase === 'analyzing_card') ? (
            /* Indeterminate Stripe Animation */
            <div 
              className="absolute inset-0 w-full h-full animate-[shimmer_1s_infinite_linear]"
              style={{
                backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)',
                backgroundSize: '1rem 1rem'
              }}
            />
          ) : (
            /* Normal Shimmer */
            <div 
              className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite_linear] -skew-x-12" 
              style={{ 
                backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                backgroundSize: '200% 100%' 
              }} 
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-amber-600/80 dark:text-amber-500/80 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-md justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" x2="12" y1="9" y2="13" />
          <line x1="12" x2="12.01" y1="17" y2="17" />
        </svg>
        <span>
          Heavy analysis in progress. Please do not close or refresh this tab.
        </span>
      </div>
    </div>
  );
}