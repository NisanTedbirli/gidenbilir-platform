'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getExperiences } from '@/lib/api'
import Link from 'next/link'
import { Heart, MessageCircle, MapPin, Volume2, VolumeX } from 'lucide-react'
import type { Experience } from '@/types'

type VideoExp = Experience & { videoUrl: string }

function VideoSlide({ exp, isActive }: { exp: VideoExp; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (isActive) {
      v.currentTime = 0
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [isActive])

  return (
    <div className="flex flex-col" style={{ height: '100dvh', scrollSnapAlign: 'start', scrollSnapStop: 'always', background: 'var(--color-bg)' }}>
      {/* Video */}
      <div className="relative flex-1 overflow-hidden rounded-2xl mx-lg mt-lg" style={{ background: '#000' }}>
        <video
          ref={videoRef}
          src={exp.videoUrl}
          className="h-full w-full object-contain"
          loop
          muted={muted}
          playsInline
        />
        {/* Mute button */}
        <button
          onClick={() => {
            if (videoRef.current) videoRef.current.muted = !muted
            setMuted(m => !m)
          }}
          className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
          aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Info — below video */}
      <div className="px-lg pt-md pb-xl flex gap-md">
        <div className="flex-1 min-w-0">
          <Link href={`/experiences/${exp.id}`}>
            <h2 className="text-text font-bold text-[16px] mb-xs line-clamp-2 hover:underline">
              {exp.title}
            </h2>
          </Link>
          <div className="flex items-center gap-2 mb-xs">
            <span>{exp.authorNationalityFlag}</span>
            <span className="text-text-sub text-[13px]">{exp.authorName}</span>
          </div>
          {exp.countryName && (
            <div className="flex items-center gap-1 text-text-mute text-[12px]">
              <MapPin size={12} />
              <span>{exp.city ? `${exp.city}, ` : ''}{exp.countryName}</span>
            </div>
          )}
        </div>
        {/* Actions */}
        <div className="flex flex-col items-center gap-lg flex-shrink-0">
          <div className="flex flex-col items-center gap-1">
            <Heart size={22} className="text-text-sub" />
            <span className="text-text-mute text-[11px]">{exp.likeCount}</span>
          </div>
          <Link href={`/experiences/${exp.id}`} className="flex flex-col items-center gap-1">
            <MessageCircle size={22} className="text-text-sub" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VideosPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['experiences', 'videos-feed'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getExperiences({ page: pageParam as number, pageSize: 10 })
      return res.data
    },
    getNextPageParam: (last) => last.hasNextPage ? last.page + 1 : undefined,
    initialPageParam: 1,
  })

  const experiences = (data?.pages.flatMap(p => p.items) ?? []).filter(
    (e): e is VideoExp => !!e.videoUrl
  )

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    setActiveIndex(Math.round(el.scrollTop / el.clientHeight))
  }, [])

  useEffect(() => {
    const sentinel = sentinelRef.current
    const container = containerRef.current
    if (!sentinel || !container) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
      },
      { root: container, rootMargin: '400px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        scrollbarWidth: 'none',
        zIndex: 40,
        background: 'var(--color-bg)',
      }}
      className="lg:left-[var(--layout-sidebar-width)]"
    >
      {isLoading && (
        <div className="flex items-center justify-center" style={{ height: '100dvh' }}>
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {!isLoading && experiences.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-lg" style={{ height: '100dvh' }}>
          <p className="text-white/70 text-lg">Henüz video yok.</p>
          <Link href="/share" className="rounded-full bg-primary px-xl py-md font-bold text-white">
            İlk videoyu ekle
          </Link>
        </div>
      )}

      {experiences.map((exp, idx) => (
        <VideoSlide key={exp.id} exp={exp} isActive={idx === activeIndex} />
      ))}

      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  )
}
