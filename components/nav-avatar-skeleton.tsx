import { Skeleton } from './ui/skeleton'

export function NavAvatarSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-9 w-9 rounded-full" />
      <Skeleton className="h-4 w-20 hidden sm:block" />
    </div>
  )
}