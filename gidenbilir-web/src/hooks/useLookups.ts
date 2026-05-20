/**
 * Lookups hook — mobile/perspektif/src/context/LookupContext.tsx'tan port edildi.
 * Mobile Context cache yerine TanStack Query cache kullanılır.
 * Lookup'lar nadiren değişir → staleTime: Infinity.
 */
import { useQuery } from '@tanstack/react-query'
import { getCategories, getCountries, getNationalities } from '@/lib/api'

export function useNationalities() {
  return useQuery({
    queryKey: ['lookups', 'nationalities'],
    queryFn: async () => (await getNationalities()).data,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useCountries() {
  return useQuery({
    queryKey: ['lookups', 'countries'],
    queryFn: async () => (await getCountries()).data,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['lookups', 'categories'],
    queryFn: async () => (await getCategories()).data,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
