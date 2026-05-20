/**
 * Auth Store — mobile/perspektif/src/context/AuthContext.tsx'tan port edildi.
 * Zustand kullanılır; persist middleware'i sadece user metadata için (token httpOnly cookie'de).
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthUser } from '@/types'

interface AuthState {
  user: AuthUser | null
  loading: boolean
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      setUser: (user) => set({ user, loading: false }),
      setLoading: (loading) => set({ loading }),
      logout: () => {
        // localStorage'ı da kesin temizle — persist hydration stale state riskini önler
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('gb_auth')
          } catch {
            // ignore
          }
        }
        set({ user: null, loading: false })
      },
    }),
    {
      name: 'gb_auth',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return localStorage
      }),
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
