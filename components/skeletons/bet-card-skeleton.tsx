import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function BetCardSkeleton() {
    return (
        <Card className="glass-card border-white/5 bg-black/20 overflow-hidden h-full">
            <CardContent className="p-5 relative space-y-4">
                {/* Title & Odds */}
                <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4 bg-white/10" />
                    <Skeleton className="h-4 w-1/4 bg-white/5" />
                </div>

                {/* Metrics Row */}
                <div className="flex gap-6 py-2">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full bg-white/10" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-2 w-16 bg-white/5" />
                            <Skeleton className="h-4 w-12 bg-white/10" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Skeleton className="h-2 w-16 bg-white/5" />
                        <Skeleton className="h-6 w-16 bg-white/10" />
                    </div>
                </div>

                {/* Badges */}
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded bg-white/5" />
                    <Skeleton className="h-5 w-20 rounded bg-white/5" />
                </div>
            </CardContent>
        </Card>
    )
}
