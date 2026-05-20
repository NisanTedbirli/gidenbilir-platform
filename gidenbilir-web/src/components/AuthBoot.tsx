'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { readUserCookie } from '@/lib/auth'
import type { AuthUser } from '@/types'

/**
 * Sayfa yüklenirken auth state'i kur:
 * 1. Cookie'den user metadata'sını oku
 * 2. Cookie varsa, hemen user göster (optimistic)
 * 3. Arka planda /api/auth/me ile doğrula — fail olursa logout
 */
export function AuthBoot() {
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    // 1. Cookie kontrolü — senkron, hemen tamamlanır
    const userJson = readUserCookie()

    if (!userJson) {
      useAuthStore.getState().setLoading(false)
      return
    }

    let user: Omit<AuthUser, 'token'> | null = null
    try {
      user = JSON.parse(userJson) as Omit<AuthUser, 'token'>
    } catch {
      useAuthStore.getState().setLoading(false)
      return
    }

    // 2. Optimistic — UI hemen açılır (setUser loading'i false yapar)
    setUser({ ...user, token: '' })

    // 3. Arka planda backend doğrula (max 5 sn)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    fetch('/api/auth/me', {
      credentials: 'include',
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok && res.status === 401) {
          logout()
        }
      })
      .catch(() => {
        // Network hatası — optimistic state'i koru, kullanıcı offline da çalışsın
      })
      .finally(() => clearTimeout(timeout))

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [setUser, logout])

  return null
}
