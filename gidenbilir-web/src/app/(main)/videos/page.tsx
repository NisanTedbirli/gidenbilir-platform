'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getExperiences, getComments, addComment } from '@/lib/api'
import Link from 'next/link'
import { Heart, MessageCircle, Send, Volume2, VolumeX, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import type { Comment, Experience } from '@/types'

type VideoExp = Experience & { videoUrl: string }

function CommentSheet({ expId, onClose }: { expId: number; onClose: () => void }) {
  const user = useAuthStore(s => s.user)
  const queryClient = useQueryClient()
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', String(expId)],
    queryFn: async () => (await getComments(expId)).data,
  })

  const mutation = useMutation({
    mutationFn: (t: string) => addComment(expId, t),
    onMutate: (t) => {
      queryClient.setQueryData(['comments', String(expId)], (old: Comment[] = []) => [
        ...old,
        { id: -1, text: t, authorFullName: user?.fullName ?? 'Siz', authorNationalityFlag: user?.nationalityFlag ?? '🌍', createdAt: new Date().toISOString(), userId: user?.userId ?? 0 },
      ])
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['comments', String(expId)] }),
  })

  const submit = () => {
    const t = text.trim()
    if (!t) return
    mutation.mutate(t)
    setText('')
  }

  const content = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div style={{ background: 'var(--color-bg-surface)', borderRadius: '16px 16px 0 0', maxHeight: '70dvh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Yorumlar</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        {/* Comments list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
          {comments.length === 0 && <p style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Henüz yorum yok.</p>}
          {comments.map((c, i) => (
            <div key={c.id !== -1 ? c.id : `tmp-${i}`} style={{ marginBottom: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{c.authorNationalityFlag} {c.authorFullName}</span>
              <p style={{ fontSize: 13, color: '#374151', marginTop: 2, maxWidth: '100%' }}>{c.text}</p>
            </div>
          ))}
        </div>
        {/* Input */}
        {user && (
          <div style={{ padding: '8px 16px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Yorum yaz..."
              style={{ flex: 1, border: '1px solid var(--color-border)', borderRadius: 20, padding: '8px 14px', fontSize: 13, background: 'var(--color-bg-elevated)', outline: 'none' }}
            />
            <button onClick={submit} disabled={!text.trim() || mutation.isPending} style={{ background: '#ff6b35', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: !text.trim() ? 0.4 : 1 }}>
              <Send size={16} color="white" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
  return typeof document !== 'undefined' ? createPortal(content, document.body) : null
}

function VideoSlide({ exp, isActive }: { exp: VideoExp; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [isLiked, setIsLiked] = useState(exp.isLikedByMe)
  const [likeCount, setLikeCount] = useState(exp.likeCount)
  const isLong = (exp.description?.length ?? 0) > 100

  const handleLike = async () => {
    setIsLiked(l => !l)
    setLikeCount(c => isLiked ? c - 1 : c + 1)
    try {
      const res = await fetch(`/api/backend/experiences/${exp.id}/like`, { method: 'POST', credentials: 'include' })
      if (res.ok) { const d = await res.json(); setLikeCount(d.likeCount); setIsLiked(d.isLikedByMe) }
    } catch { setIsLiked(exp.isLikedByMe); setLikeCount(exp.likeCount) }
  }

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
    <div style={{ height: '100dvh', scrollSnapAlign: 'start', scrollSnapStop: 'always', background: 'var(--color-bg)' }}>
      {/* Video — 85% */}
      <div style={{ position: 'relative', height: '85dvh', margin: '12px 16px 0', borderRadius: '16px', overflow: 'hidden', background: '#f0ebe5' }}>
        <video
          ref={videoRef}
          src={exp.videoUrl}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          loop
          muted={muted}
          playsInline
        />
        <button
          onClick={() => { if (videoRef.current) videoRef.current.muted = !muted; setMuted(m => !m) }}
          style={{ position: 'absolute', bottom: 12, right: 12, width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
          aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Info — 15% */}
      <div style={{ height: 'calc(15dvh - 12px)', padding: '8px 16px 4px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 48px', gap: 8, alignItems: 'start' }}>

        {/* Sol: metin */}
        <div>
          <Link href={`/experiences/${exp.id}`}>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {exp.title}
            </p>
          </Link>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 3 }}>
            {exp.authorNationalityFlag} {exp.authorName}
            {exp.countryName && <> · {exp.city ? `${exp.city}, ` : ''}{exp.countryName}</>}
          </p>
          {exp.description && (
            <>
              <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4, display: expanded ? 'block' : '-webkit-box', WebkitLineClamp: expanded ? undefined : 2, WebkitBoxOrient: 'vertical' as const, overflow: expanded ? 'visible' : 'hidden' }}>
                {exp.description}
              </p>
              {isLong && (
                <button onClick={() => setExpanded(e => !e)} style={{ fontSize: 11, color: '#ff6b35', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 2 }}>
                  {expanded ? 'Daha az' : '...devamını gör'}
                </button>
              )}
            </>
          )}
        </div>

        {/* Sağ: ikonlar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: 0 }}>
            <Heart size={20} fill={isLiked ? '#ff6b6b' : 'none'} color={isLiked ? '#ff6b6b' : '#6b7280'} />
            <span style={{ fontSize: 10, color: '#6b7280' }}>{likeCount}</span>
          </button>
          <button onClick={() => setShowComments(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <MessageCircle size={20} color="#6b7280" />
          </button>
        </div>
      </div>

      {showComments && <CommentSheet expId={exp.id} onClose={() => setShowComments(false)} />}
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
        right: 0,
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        scrollbarWidth: 'none',
        zIndex: 40,
        background: 'var(--color-bg)',
      }}
      className="left-0 lg:left-[var(--layout-sidebar-width)]"
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
