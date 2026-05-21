'use client'

import { useEffect, useRef, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getExperiences } from '@/lib/api'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import Link from 'next/link'
import type { Experience } from '@/types'

export default function VideosPage() {
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['experiences', 'videos'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getExperiences({ page: pageParam, pageSize: 10 })
      return res.data
    },
    getNextPageParam: (last) => last.hasNextPage ? last.page + 1 : undefined,
    initialPageParam: 1,
  })

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const experiences = (data?.pages.flatMap(p => p.items) ?? []).filter(
    (e): e is Experience & { videoUrl: string } => !!e.videoUrl
  )

  return (
    <div className="container-content py-xl">
      <header className="mb-2xl">
        <h1 className="mb-sm font-extrabold tracking-tight" style={{ fontSize: 'var(--text-title)' }}>
          Videolar
        </h1>
        <p className="text-text-sub">Seyahat deneyimlerinden videolar</p>
      </header>

      {isLoading && (
        <div className="flex justify-center py-2xl">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {!isLoading && experiences.length === 0 && (
        <div className="py-2xl text-center">
          <p className="text-text-sub mb-md">Henüz video içeren deneyim yok.</p>
          <Link href="/share" className="font-bold text-primary hover:underline">
            İlk videoyu sen ekle
          </Link>
        </div>
      )}

      <div className="space-y-2xl max-w-xl mx-auto">
        {experiences.map((exp) => (
          <div key={exp.id} className="rounded-2xl overflow-hidden border border-border bg-bg-surface shadow-md">
            <VideoPlayer
              src={exp.videoUrl}
              title={exp.title}
              className="aspect-video w-full"
            />
            <div className="p-lg">
              <Link href={`/experiences/${exp.id}`} className="hover:underline">
                <h2 className="font-bold text-text text-[17px] mb-xs">{exp.title}</h2>
              </Link>
              <p className="text-[13px] text-text-sub">
                <span>{exp.authorNationalityFlag}</span>{' '}
                <span>{exp.authorName}</span>
                {' · '}
                <span>{exp.countryFlag} {exp.countryName}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="h-16 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
      </div>
    </div>
  )
}
