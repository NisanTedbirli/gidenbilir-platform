export default function MainLoading() {
  return (
    <div className="container-content py-xl" aria-busy="true" aria-live="polite">
      <div className="mb-2xl">
        <div className="h-8 w-48 bg-bg-elevated rounded animate-pulse mb-sm" />
        <div className="h-4 w-72 bg-bg-elevated rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-bg-surface overflow-hidden">
            <div className="aspect-video bg-bg-elevated animate-pulse" />
            <div className="p-lg space-y-sm">
              <div className="h-4 w-3/4 bg-bg-elevated rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-bg-elevated rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-bg-elevated rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">İçerik yükleniyor</span>
    </div>
  )
}
