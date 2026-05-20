/**
 * Auth route group layout — sidebar olmadan, ortalanmış card.
 * Hero gradient zemin + form card.
 */
import Link from 'next/link'
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-dvh items-center justify-center px-lg py-xl"
      style={{ background: 'var(--gradient-hero)' }}
    >
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-xl block text-center text-[28px] font-extrabold tracking-tight"
          style={{
            backgroundImage: 'var(--gradient-primary)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          GidenBilir
        </Link>
        <main
          id="main-content"
          className="rounded-2xl border border-border bg-bg-surface p-xl shadow-lg sm:p-2xl"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
