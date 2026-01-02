import { Skeleton } from './ui/skeleton'

function MarketEdgeSkeleton() {
  return (
        <>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <Skeleton className="h-5 w-32" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
        </>
  )
}

export default MarketEdgeSkeleton