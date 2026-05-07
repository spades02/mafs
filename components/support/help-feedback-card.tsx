"use client";

import { useState } from "react";
import { Mail, MessageSquare, Lightbulb, Bug, ChevronRight, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupportModal } from "@/components/support/support-modal";
import { cn } from "@/lib/utils";

type Row = {
  type: "support" | "feedback" | "feature_request" | "bug";
  title: string;
  description: string;
  icon: typeof Mail;
  iconBg: string;
  iconColor: string;
};

const ROWS: Row[] = [
  {
    type: "support",
    title: "Contact Support",
    description: "Get help with billing, account access, simulations, or app issues.",
    icon: Mail,
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
  },
  {
    type: "feedback",
    title: "Send Feedback",
    description: "Share ideas, bugs, UI feedback, or pick/simulation feedback.",
    icon: MessageSquare,
    iconBg: "bg-sky-500/15",
    iconColor: "text-sky-400",
  },
  {
    type: "feature_request",
    title: "Feature Request",
    description: "Suggest what MAFS should build next.",
    icon: Lightbulb,
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
  },
  {
    type: "bug",
    title: "Report Bug",
    description: "Tell us what broke so we can fix it fast.",
    icon: Bug,
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-400",
  },
];

export function HelpFeedbackCard({ className }: { className?: string }) {
  const [activeType, setActiveType] = useState<Row["type"] | null>(null);

  return (
    <>
      <Card className={cn("bg-[#0f1419]/60 border-border/50 backdrop-blur-sm", className)}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <HelpCircle className="h-5 w-5 text-emerald-400" />
            Help &amp; Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ROWS.map((row) => {
            const Icon = row.icon;
            return (
              <button
                key={row.type}
                type="button"
                onClick={() => setActiveType(row.type)}
                className="w-full flex items-center gap-4 rounded-lg border border-border/40 bg-background/40 hover:bg-background/70 hover:border-primary/30 transition-colors p-4 text-left group"
              >
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg shrink-0", row.iconBg)}>
                  <Icon className={cn("h-5 w-5", row.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{row.title}</p>
                  <p className="text-xs text-muted-foreground/80 mt-0.5 truncate">{row.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* One controlled modal per row type — keyed so each opens with its own defaultType */}
      {ROWS.map((row) => (
        <SupportModal
          key={row.type}
          defaultType={row.type}
          hideTrigger
          open={activeType === row.type}
          onOpenChange={(o) => {
            if (!o) setActiveType(null);
          }}
        />
      ))}
    </>
  );
}
