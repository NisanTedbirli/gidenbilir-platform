'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { readPrevPath } from '@/components/NavigationTracker'

/**
 * Geldiği sayfaya geri döner. NavigationTracker'ın sessionStorage'a
 * yazdığı önceki pathname'i kullanır. Profil → detay → geri = profil.
 */
export function BackLink() {
  const router = useRouter()
  const [target, setTarget] = useState<string>('/')
  const [label, setLabel] = useState('Ana sayfaya dön')

  useEffect(() => {
    const prev = readPrevPath()
    if (!prev) {
      setTarget('/')
      setLabel('Ana sayfaya dön')
      return
    }

    setTarget(prev)
    if (prev.startsWith('/profile/')) setLabel('Profile dön')
    else if (prev.startsWith('/discover')) setLabel('Keşfet\'e dön')
    else if (prev === '/' || prev === '') setLabel('Ana sayfaya dön')
    else if (prev.startsWith('/messages')) setLabel('Mesajlara dön')
    else setLabel('Geri dön')
  }, [])

  return (
    <button
      type="button"
      onClick={() => router.push(target)}
      className="text-sm font-semibold text-primary hover:underline mb-lg block"
    >
      ← {label}
    </button>
  )
}
