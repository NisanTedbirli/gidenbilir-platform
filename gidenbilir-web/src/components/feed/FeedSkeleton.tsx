export function FeedSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-border bg-bg-surface animate-pulse"
        >
          {/* Cover Photo Skeleton */}
          <div className="aspect-video bg-bg-elevated" />

          {/* Card Body Skeleton */}
          <div className="p-lg space-y-md">
            {/* Title */}
            <div className="h-6 bg-bg-elevated rounded w-3/4" />

            {/* Author */}
            <div className="h-5 bg-bg-elevated rounded w-1/2" />

            {/* Location */}
            <div className="h-5 bg-bg-elevated rounded w-2/3" />

            {/* Stats */}
            <div className="space-y-md">
              <div className="h-5 bg-bg-elevated rounded w-1/3" />
              <div className="h-5 bg-bg-elevated rounded w-full" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
