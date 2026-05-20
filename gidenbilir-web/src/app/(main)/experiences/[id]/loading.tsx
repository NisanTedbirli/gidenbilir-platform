export default function DetailLoading() {
  return (
    <div className="container-content py-xl" aria-busy="true" aria-live="polite">
      <div className="h-4 w-32 bg-bg-elevated rounded animate-pulse mb-lg" />
      <div className="grid lg:grid-cols-[3fr_2fr] gap-2xl mb-2xl">
        <div className="aspect-video bg-bg-elevated rounded-2xl animate-pulse" />
        <div className="space-y-md">
          <div className="h-9 w-3/4 bg-bg-elevated rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-bg-elevated rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-bg-elevated rounded animate-pulse" />
          <div className="h-32 bg-bg-elevated rounded animate-pulse mt-lg" />
          <div className="h-24 bg-bg-elevated rounded animate-pulse" />
        </div>
      </div>
      <span className="sr-only">Deneyim yükleniyor</span>
    </div>
  )
}
