// components/nav-bar-skeleton.tsx
import { Skeleton } from "../ui/skeleton"

export function NavBarSkeleton() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter-bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="hidden h-4 w-48 md:block" />
            </div>
          </div>

          {/* Center Nav Skeleton */}
          <div className="hidden items-center gap-1 md:flex">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>

          {/* Right Side Skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-36 rounded-full" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="hidden h-4 w-20 sm:block" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}