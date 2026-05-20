'use client'

import Link from 'next/link'

/**
 * Mobil/tablet'te (lg breakpoint altında) görünen üst bar.
 * Logo + opsiyonel başlık. Sidebar lg+'da göründüğünde gizlenir.
 */
export function Topbar() {
  return (
    <header
      className="sticky top-0 z-sticky flex h-[var(--layout-header-height)] items-center justify-between border-b border-border bg-bg-surface/95 px-lg backdrop-blur-sm lg:hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <Link
        href="/"
        className="text-[20px] font-extrabold tracking-tight"
        style={{
          backgroundImage: 'var(--gradient-primary)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        }}
      >
        GidenBilir
      </Link>
    </header>
  )
}
