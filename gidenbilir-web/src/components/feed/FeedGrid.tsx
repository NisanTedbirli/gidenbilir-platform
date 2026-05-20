'use client'

import { useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getExperiences } from '@/lib/api'
import { ExperienceCard } from './ExperienceCard'
import { FeedSkeleton } from './FeedSkeleton'
import type { ExperienceFilters } from '@/types'

const PAGE_SIZE = 20

interface FeedGridProps {
  filters?: ExperienceFilters
}

export function FeedGrid({ filters }: FeedGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['experiences', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getExperiences({ ...filters, page: pageParam, pageSize: PAGE_SIZE })
      return response.data
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  })

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const experiences = data?.pages.flatMap((page) => page.items ?? []) ?? []

  if (error) {
    return (
      <div className="py-xl text-center">
        <p className="text-text-sub mb-md">Deneyimler yüklenemedi.</p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary font-bold hover:underline"
        >
          Sayfayı yenile
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
        <FeedSkeleton />
      </div>
    )
  }

  if (experiences.length === 0) {
    return (
      <div className="py-2xl text-center">
        <p className="text-text-sub mb-md">Henüz deneyim yok.</p>
        <p className="text-[13px] text-text-mute">
          İlk deneyiminizi paylaşmak için Paylaş sayfasını ziyaret edin.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
        {experiences.map((exp, idx) => (
          <ExperienceCard key={exp.id} experience={exp} priority={idx < 3} />
        ))}
      </div>

      {/* Infinite Scroll Sentinel */}
      <div ref={sentinelRef} className="h-32 flex items-center justify-center">
        {isFetchingNextPage ? (
          <div className="text-center text-text-sub">
            <div className="inline-block h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : null}
      </div>
    </>
  )
}
