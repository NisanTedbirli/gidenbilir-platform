'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { NavigationTracker } from '@/components/NavigationTracker'
import type { ReactNode } from 'react'

/**
 * Auth guard wrapper — eğer logged out ise /login'e yönlendir.
 */
export function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-bg">
        <p className="text-text-sub">Yükleniyor...</p>
      </div>
    )
  }

  if (!user) {
    return null // redirect yapılıyor
  }

  return (
    <div className="min-h-dvh bg-bg">
      <NavigationTracker />
      <Sidebar />
      <MobileNav />
      <main id="main-content" className="lg:pl-[var(--layout-sidebar-width)]">
        <div className="pb-[88px] lg:pb-0">{children}</div>
      </main>
    </div>
  )
}
