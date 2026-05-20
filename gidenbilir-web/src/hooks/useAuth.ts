/**
 * useAuth — auth mutations + Zustand store wrapper.
 * Login/Register/Logout, /api/auth/* endpoint'lerine istek atar (cookie set/clear).
 */
'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import type { AuthUser } from '@/types'

type LoginInput = { email: string; password: string }
type RegisterInput = {
  fullName: string
  email: string
  password: string
  nationalityId: number
}

async function postJSON<TIn, TOut>(url: string, body: TIn): Promise<TOut> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error((data as { message?: string }).message ?? 'Bir hata oluştu.')
  }
  return data as TOut
}

export function useAuth() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const logoutStore = useAuthStore((s) => s.logout)

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) =>
      postJSON<LoginInput, Omit<AuthUser, 'token'>>('/api/auth/login', input),
    onSuccess: (data) => {
      // Token cookie'de — store'a metadata + placeholder token koyuyoruz
      // (gerçek token client'a expose edilmez)
      setUser({ ...data, token: '' })
    },
  })

  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) =>
      postJSON<RegisterInput, Omit<AuthUser, 'token'>>('/api/auth/register', input),
    onSuccess: (data) => {
      setUser({ ...data, token: '' })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', { method: 'POST' })
    },
    onSuccess: () => {
      logoutStore()
      router.replace('/login')
    },
  })

  return {
    user,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    loginPending: loginMutation.isPending,
    registerPending: registerMutation.isPending,
    logoutPending: logoutMutation.isPending,
    loginError: loginMutation.error?.message ?? null,
    registerError: registerMutation.error?.message ?? null,
  }
}
