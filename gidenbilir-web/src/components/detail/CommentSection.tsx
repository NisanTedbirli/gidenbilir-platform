'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getComments,
  addComment,
  deleteComment,
} from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { timeAgo } from '@/lib/dateUtils'
import type { Comment } from '@/types'
import { Trash2 } from 'lucide-react'
import { Button, ErrorBox } from '@/components/ui'

interface CommentSectionProps {
  experienceId: string
}

export function CommentSection({ experienceId }: CommentSectionProps) {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [newComment, setNewComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const numId = Number(experienceId)

  // Fetch comments
  const {
    data: commentsData = [],
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['comments', experienceId],
    queryFn: async () => {
      const response = await getComments(numId)
      return response.data
    },
  })

  const comments = commentsData

  // Add comment mutation
  const addMutation = useMutation({
    mutationFn: (text: string) => addComment(numId, text),
    onMutate: (newText) => {
      setError(null)
      // Optimistically add comment
      const previous = queryClient.getQueryData(['comments', experienceId])
      queryClient.setQueryData(['comments', experienceId], (old: Comment[]) => [
        ...old,
        {
          id: -1,
          text: newText,
          authorFullName: user?.fullName ?? 'Siz',
          authorNationalityFlag: user?.nationalityFlag ?? '🌍',
          createdAt: new Date().toISOString(),
          userId: user?.userId ?? 0,
        },
      ])
      return { previous }
    },
    onSuccess: () => {
      setNewComment('')
      queryClient.invalidateQueries({ queryKey: ['comments', experienceId] })
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['comments', experienceId], context?.previous)
      setError('Yorum gönderilemedi.')
    },
  })

  // Delete comment mutation
  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(numId, commentId),
    onMutate: (commentId) => {
      setError(null)
      const previous = queryClient.getQueryData(['comments', experienceId])
      queryClient.setQueryData(['comments', experienceId], (old: Comment[]) =>
        old.filter((c: Comment) => c.id !== commentId)
      )
      return { previous }
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['comments', experienceId], context?.previous)
      setError('Yorum silinemedi.')
    },
  })

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    if (!user) return // Should not happen due to conditional rendering

    addMutation.mutate(newComment.trim())
  }

  const handleDelete = (commentId: number) => {
    if (confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
      deleteMutation.mutate(commentId)
    }
  }

  if (fetchError) {
    return (
      <div className="text-center py-xl">
        <p className="text-text-sub">Yorumlar yüklenemedi.</p>
      </div>
    )
  }

  return (
    <div className="space-y-xl">
      <h3 className="text-[18px] font-bold text-text">
        Yorumlar ({comments.length})
      </h3>

      {/* Comment List */}
      {isLoading ? (
        <div className="text-center py-lg text-text-sub">Yükleniyor...</div>
      ) : comments.length === 0 ? (
        <p className="text-center py-lg text-text-sub">
          Henüz yorum yok. İlk yorumu siz yapabilirsiniz!
        </p>
      ) : (
        <div className="space-y-md">
          {comments.map((comment: Comment) => (
            <div
              key={comment.id}
              className="rounded-lg bg-bg-elevated p-md border border-border"
            >
              {/* Author */}
              <div className="flex items-center justify-between mb-sm">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">{comment.authorNationalityFlag}</span>
                  <span className="font-semibold text-[14px] text-text">
                    {comment.authorFullName}
                  </span>
                </div>

                {/* Delete Button */}
                {user?.userId === comment.userId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={deleteMutation.isPending}
                    className="text-text-mute hover:text-danger transition p-1"
                    aria-label="Yorumu sil"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Comment Text */}
              <p className="text-[14px] text-text mb-sm">{comment.text}</p>

              {/* Date */}
              <time className="text-[12px] text-text-mute">
                {timeAgo(comment.createdAt)}
              </time>
            </div>
          ))}
        </div>
      )}

      {/* Error Messages */}
      <ErrorBox message={error} />

      {/* Add Comment Form */}
      {user ? (
        <form onSubmit={handleAddComment} className="space-y-md border-t border-border pt-xl">
          <div>
            <label htmlFor="comment-input" className="text-[12px] font-bold uppercase tracking-wider text-text-sub block mb-xs">
              Yorum Yap
            </label>
            <textarea
              id="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (newComment.trim() && !addMutation.isPending) {
                    addMutation.mutate(newComment.trim())
                  }
                }
              }}
              placeholder="Deneyimini paylaş... (Enter: gönder, Shift+Enter: yeni satır)"
              className="w-full rounded-2xl border-[1.5px] border-border bg-bg-surface px-lg py-md text-[15px] text-text placeholder:text-text-mute focus:border-primary focus:outline-none resize-none"
              rows={3}
              disabled={addMutation.isPending}
            />
          </div>

          <Button
            type="submit"
            disabled={!newComment.trim() || addMutation.isPending}
            isLoading={addMutation.isPending}
          >
            Gönder
          </Button>
        </form>
      ) : (
        <div className="text-center py-lg rounded-lg bg-bg-elevated">
          <p className="text-text-sub mb-md">Yorum yapmak için giriş yapmalısınız.</p>
        </div>
      )}
    </div>
  )
}
