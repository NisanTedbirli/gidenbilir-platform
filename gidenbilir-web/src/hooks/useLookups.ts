/**
 * Lookups hook — mobile/perspektif/src/context/LookupContext.tsx'tan port edildi.
 * Mobile Context cache yerine TanStack Query cache kullanılır.
 * Lookup'lar nadiren değişir → staleTime: Infinity.
 */
import { useQuery } from '@tanstack/react-query'
import { getCategories, getCountries, getNationalities } from '@/lib/api'

const LOOKUP_OPTIONS = {
  staleTime: 10 * 60_000,  // 10 dakika — Render cold-start sonrası yenilenir
  gcTime: 30 * 60_000,
  retry: 3,
  retryDelay: 2000,
  refetchOnMount: true,
} as const

export function useNationalities() {
  return useQuery({
    queryKey: ['lookups', 'nationalities'],
    queryFn: async () => (await getNationalities()).data,
    ...LOOKUP_OPTIONS,
  })
}

export function useCountries() {
  return useQuery({
    queryKey: ['lookups', 'countries'],
    queryFn: async () => (await getCountries()).data,
    ...LOOKUP_OPTIONS,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['lookups', 'categories'],
    queryFn: async () => (await getCategories()).data,
    ...LOOKUP_OPTIONS,
  })
}
