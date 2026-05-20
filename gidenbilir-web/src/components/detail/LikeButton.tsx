'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'

interface LikeButtonProps {
  experienceId: number
  initialLikeCount: number
  initialIsLiked: boolean
}

export function LikeButton({ experienceId, initialLikeCount, initialIsLiked }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isPending, setIsPending] = useState(false)

  const handleLike = async () => {
    const prevLiked = isLiked
    const prevCount = likeCount

    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
    setIsPending(true)

    try {
      const response = await fetch(`/api/backend/experiences/${experienceId}/like`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Like failed')
      const data = await response.json()
      setLikeCount(data.likeCount)
      setIsLiked(data.isLikedByMe)
    } catch {
      setIsLiked(prevLiked)
      setLikeCount(prevCount)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-bg-elevated hover:bg-bg-surface transition disabled:opacity-50 cursor-pointer"
    >
      <Heart
        size={20}
        fill={isLiked ? 'currentColor' : 'none'}
        color={isLiked ? '#ff6b6b' : 'var(--color-text-sub)'}
      />
      <span className="font-semibold text-[15px]" style={{ color: 'var(--color-text)' }}>
        {likeCount}
      </span>
    </button>
  )
}
