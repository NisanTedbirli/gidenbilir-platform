'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getExperiences } from '@/lib/api'
import Link from 'next/link'
import { Heart, MessageCircle, MapPin, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import type { Experience } from '@/types'

type VideoExperience = Experience & { videoUrl: string }

function VideoItem({ exp, isActive }: { exp: VideoExperience; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isActive) {
      video.currentTime = 0
      video.play().then(() => setPlaying(true)).catch(() => {})
    } else {
      video.pause()
      setPlaying(false)
    }
  }, [isActive])

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!videoRef.current) return
    videoRef.current.muted = !muted
    setMuted(!muted)
  }

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={exp.videoUrl}
        className="w-full h-full object-contain"
        loop
        muted={muted}
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Gradient overlay bottom */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-14 p-lg pb-xl">
        <Link href={`/experiences/${exp.id}`} className="block">
          <h2 className="text-white font-bold text-[18px] mb-xs line-clamp-2 drop-shadow">
            {exp.title}
          </h2>
        </Link>
        <div className="flex items-center gap-2 mb-sm">
          <span className="text-lg">{exp.authorNationalityFlag}</span>
          <span className="text-white/90 text-[14px] font-medium">{exp.authorName}</span>
        </div>
        <div className="flex items-center gap-1 text-white/80 text-[13px]">
          <MapPin size={13} />
          <span>{exp.city ? `${exp.city}, ` : ''}{exp.countryName}</span>
        </div>
      </div>

      {/* Right action buttons */}
      <div className="absolute right-3 bottom-xl flex flex-col items-center gap-xl">
        {/* Mute */}
        <button
          onClick={toggleMute}
          className="flex flex-col items-center gap-1"
          aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
        >
          <div className="flex size-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            {muted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
          </div>
        </button>

        {/* Like */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex size-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Heart size={20} className="text-white" />
          </div>
          <span className="text-white text-[12px] font-bold">{exp.likeCount}</span>
        </div>

        {/* Comments */}
        <Link href={`/experiences/${exp.id}`}>
          <div className="flex flex-col items-center gap-1">
            <div className="flex size-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <MessageCircle size={20} className="text-white" />
            </div>
          </div>
        </Link>
      </div>

      {/* Playing indicator — subtle pulse when active */}
      {isActive && playing && (
        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="text-white text-[11px] font-bold">CANLI</span>
        </div>
      )}
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
      const res = await getExperiences({ page: pageParam, pageSize: 10 })
      return res.data
    },
    getNextPageParam: (last) => last.hasNextPage ? last.page + 1 : undefined,
    initialPageParam: 1,
  })

  const experiences = (data?.pages.flatMap(p => p.items) ?? []).filter(
    (e): e is VideoExperience => !!e.videoUrl
  )

  // Scroll snap ile aktif video tespiti
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const { scrollTop, clientHeight } = containerRef.current
    const index = Math.round(scrollTop / clientHeight)
    setActiveIndex(index)
  }, [])

  // Infinite scroll sentinel
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
      },
      { root: containerRef.current, rootMargin: '400px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="fixed inset-0 lg:left-[var(--layout-sidebar-width)] overflow-y-scroll"
      style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}
    >
      {isLoading && (
        <div className="flex h-screen items-center justify-center bg-black">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {!isLoading && experiences.length === 0 && (
        <div className="flex h-screen flex-col items-center justify-center bg-black gap-lg">
          <p className="text-white/70 text-lg">Henüz video yok.</p>
          <Link href="/share" className="rounded-full bg-primary px-xl py-md font-bold text-white">
            İlk videoyu ekle
          </Link>
        </div>
      )}

      {experiences.map((exp, idx) => (
        <div
          key={exp.id}
          className="w-full bg-black"
          style={{ height: '100dvh', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
        >
          <VideoItem exp={exp} isActive={idx === activeIndex} />
        </div>
      ))}

      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  )
}
