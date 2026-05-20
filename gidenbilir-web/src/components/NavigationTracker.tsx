'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const STORAGE_KEY = 'gb_nav_prev'

/**
 * Her route değişiminde önceki pathname'i sessionStorage'a yazar.
 * BackLink bunu okuyup geldiği yere dönmek için kullanır.
 */
export function NavigationTracker() {
  const pathname = usePathname()
  const prevRef = useRef<string | null>(null)

  useEffect(() => {
    if (prevRef.current !== null && prevRef.current !== pathname) {
      try {
        sessionStorage.setItem(STORAGE_KEY, prevRef.current)
      } catch {
        // ignore
      }
    }
    prevRef.current = pathname
  }, [pathname])

  return null
}

export function readPrevPath(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}
