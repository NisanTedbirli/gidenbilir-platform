'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // TODO: Sentry.captureException(error)
    console.error('[global-error]', error)
  }, [error])

  return (
    <div className="min-h-dvh flex items-center justify-center p-2xl bg-bg">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-md" aria-hidden="true">⚠️</div>
        <h1 className="text-[28px] font-extrabold tracking-tight mb-sm text-text">
          Bir şeyler ters gitti
        </h1>
        <p className="text-text-sub mb-lg">
          {process.env.NODE_ENV === 'development' ? error.message : 'Beklenmedik bir hata oluştu. Tekrar dene veya birazdan dön.'}
        </p>
        {error.digest && (
          <p className="text-[12px] text-text-mute mb-lg font-mono">
            Hata kodu: {error.digest}
          </p>
        )}
        <div className="flex gap-md justify-center">
          <button
            onClick={reset}
            className="px-lg py-md rounded-xl bg-primary text-white font-bold hover:brightness-110 transition"
          >
            Tekrar dene
          </button>
          <Link
            href="/"
            className="px-lg py-md rounded-xl bg-bg-elevated text-text font-bold hover:bg-border transition"
          >
            Ana sayfa
          </Link>
        </div>
      </div>
    </div>
  )
}
