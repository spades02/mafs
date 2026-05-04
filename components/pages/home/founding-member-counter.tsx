"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Counts = {
  founding: number;
  foundingCap: number;
  totalPro: number;
  totalGoal: number;
};

export function FoundingMemberCounter({ className }: { className?: string }) {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/founding-member-count")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Counts | null) => {
        if (!cancelled && data) setCounts(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!counts) {
    return (
      <div className={cn("h-3 w-full rounded-full bg-white/5", className)} aria-hidden />
    );
  }

  const foundingPct = Math.min(100, (counts.founding / counts.foundingCap) * 100);
  const totalPct = Math.min(100, (counts.totalPro / counts.totalGoal) * 100);
  const foundingClosed = counts.founding >= counts.foundingCap;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground/80">
        <span>{foundingClosed ? "Founding pricing closed" : "Founding members"}</span>
        <span className="font-mono text-primary">
          {counts.founding} / {counts.foundingCap}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${foundingPct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground/60 pt-1">
        <span>MAFS members</span>
        <span className="font-mono">
          {counts.totalPro} / {counts.totalGoal}
        </span>
      </div>
      <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full bg-muted-foreground/40 rounded-full"
          style={{ width: `${totalPct}%` }}
        />
      </div>
    </div>
  );
}
