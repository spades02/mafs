"use client";

import { useEffect, useState } from "react";

interface AnalysisProgressProps {
  progress: number;
  processed: number;
  total: number;
  isComplete: boolean;
}

export default function AnalysisProgress({
  progress,
  processed,
  total,
  isComplete,
}: AnalysisProgressProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (isComplete) return null;

  // 1. Detect Indeterminate State (Working, but total unknown)
  const isIndeterminate = total === 0 && processed > 0;
  const isStarting = total === 0 && processed === 0;

  // 2. Safe percentage calculation
  // If indeterminate, we default to 100% width but use a different animation style
  const percentage = isIndeterminate ? 100 : Math.min(100, Math.max(0, total > 0 ? progress : 0));

  // 3. Smart Status Text
  let statusText = "";
  if (isStarting) {
    statusText = "Initializing engine";
  } else if (isIndeterminate) {
    // FIX: Don't show "of 0", just show current count
    statusText = `Analyzing fight ${processed + 1}`;
  } else {
    statusText = `Analyzing fight ${processed + 1} of ${total}`;
  }

  return (
    <div className="mb-8 w-full max-w-2xl mx-auto space-y-3">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {statusText}{dots}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            Processing market edges and fight breakdowns
          </span>
        </div>
        
        {/* FIX: Only show percentage if we actually know the total */}
        {!isIndeterminate && !isStarting && (
          <div className="text-sm font-bold text-primary">
            {Math.round(percentage)}%
          </div>
        )}
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/50 border border-border">
        <div
          className={`h-full bg-primary transition-all duration-500 ease-out relative overflow-hidden ${
            isIndeterminate ? "animate-pulse" : ""
          }`}
          style={{ width: `${percentage}%` }}
        >
          {/* Animation Logic:
             If Indeterminate: We show a fast-moving striped texture to indicate "working"
             If Normal: We show the shimmer effect 
          */}
          {isIndeterminate ? (
             /* Barber-pole / Indeterminate Stripe Animation */
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