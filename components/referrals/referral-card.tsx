"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Copy, Gift } from "lucide-react";
import { toast } from "sonner";

type ReferralData = {
  code: string | null;
  link: string | null;
  stats: { pending: number; paid: number; rewarded: number; fraudulent: number };
};

export function ReferralCard({ className }: { className?: string }) {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/referrals/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d && !d.error) setData(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const copyLink = async () => {
    if (!data?.link) return;
    try {
      await navigator.clipboard.writeText(data.link);
      setCopied(true);
      toast.success("Referral link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — long-press the link to share manually");
    }
  };

  if (!data) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="h-24 animate-pulse bg-white/5 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data.code) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Your referral code is being set up. Refresh in a moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Gift className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Refer a friend</h3>
            <p className="text-xs text-muted-foreground">
              They get 50% off their first month. You get 1 free month for every paid referral.
            </p>
          </div>
        </div>

        <div className="rounded-md border border-border/60 bg-[#0F1117] px-3 py-2 flex items-center justify-between gap-2">
          <code className="text-sm text-primary truncate font-mono">{data.link}</code>
          <Button size="sm" variant="ghost" onClick={copyLink} aria-label="Copy referral link">
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Signed up" value={data.stats.pending} />
          <Stat label="Paid" value={data.stats.paid} />
          <Stat label="Rewarded" value={data.stats.rewarded} />
        </div>

        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
          Reward credited after referee pays their second month.
        </p>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border/40 bg-[#0F1117] py-2">
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70">{label}</div>
    </div>
  );
}
