import { FeedGrid } from '@/components/feed/FeedGrid'

export default function HomePage() {
  return (
    <div className="container-content py-xl">
      <header className="mb-2xl">
        <h1
          className="mb-sm font-extrabold tracking-tight"
          style={{
            fontSize: 'var(--text-title)',
            letterSpacing: 'var(--tracking-tight)',
          }}
        >
          Ana Sayfa
        </h1>
        <p className="text-text-sub">
          Dünyanın her yerinden seyahat deneyimleri.
        </p>
      </header>

      <FeedGrid />
    </div>
  )
}
