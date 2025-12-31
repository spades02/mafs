import { Button } from "@/components/ui/button";
import { Sparkles, Lock } from "lucide-react";

interface AnalysisButtonProps {
  user: {
    isPro: boolean;
    analysisCount: number;
  } | null;
  authLoading: boolean;
  selectedEvent: boolean;
  loading: boolean;
  onRunAnalysis: () => void;
  maxFreeAnalyses?: number;
}

export default function AnalysisButton({
  user,
  authLoading,
  selectedEvent,
  loading,
  onRunAnalysis,
  maxFreeAnalyses = 3,
}: AnalysisButtonProps) {
  if (authLoading) return null;

  const isPro = user?.isPro || false;
  const analysisCount = user?.analysisCount || 0;
  const remainingFree = Math.max(0, maxFreeAnalyses - analysisCount);
  const hasFreeLimitReached = !isPro && remainingFree === 0;

  // Pro user - full access
  if (isPro) {
    return (
      <Button
        onClick={onRunAnalysis}
        disabled={!selectedEvent || loading}
        className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[200px]"
      >
        {loading ? (
          "Analyzing..."
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Run Full Card Analysis
          </>
        )}
      </Button>
    );
  }

  // Free user - limit reached
  if (hasFreeLimitReached) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
          <Lock className="inline h-3.5 w-3.5 mr-1" />
          Free analyses used: {analysisCount}/{maxFreeAnalyses}
        </div>
        <Button
          onClick={() => (window.location.href = "/billing")}
          className="bg-linear-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-400 hover:to-amber-400 font-semibold min-w-[200px]"
        >
          Upgrade to Pro for Unlimited Runs
        </Button>
      </div>
    );
  }

  // Free user - has remaining analyses
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
        Free analyses remaining: <span className="font-semibold text-foreground">{remainingFree}/{maxFreeAnalyses}</span>
      </div>
      <Button
        onClick={onRunAnalysis}
        disabled={!selectedEvent || loading}
        className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[200px]"
      >
        {loading ? "Analyzing..." : "Run Full Card Analysis"}
      </Button>
      <button
        onClick={() => (window.location.href = "/billing")}
        className="text-xs text-muted-foreground hover:text-foreground underline decoration-dotted"
      >
        Upgrade for unlimited analysis runs
      </button>
    </div>
  );
}