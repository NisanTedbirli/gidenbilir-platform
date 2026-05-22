'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect, useState, type ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { AuthBoot } from '@/components/AuthBoot'
import { PostHogProvider } from '@/lib/posthog'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60_000,  // 5 dakika — API çağrısını azaltır
            gcTime: 10 * 60_000,    // 10 dakika cache'de tut
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  // 401 event handler — API interceptor yayar, store temizlenir
  useEffect(() => {
    const handler = () => useAuthStore.getState().logout()
    window.addEventListener('auth:unauthorized', handler)
    return () => window.removeEventListener('auth:unauthorized', handler)
  }, [])

  // Cross-tab sync: bir tab'da logout olunca diğerleri de logout olsun
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'gb_auth' && e.newValue === null) {
        useAuthStore.getState().logout()
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return (
    <PostHogProvider>
      <QueryClientProvider client={queryClient}>
        <AuthBoot />
        {children}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </PostHogProvider>
  )
}
