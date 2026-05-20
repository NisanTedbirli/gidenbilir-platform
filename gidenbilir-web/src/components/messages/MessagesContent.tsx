'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { isConversationUnread } from '@/hooks/useUnreadMessages'
import type { Conversation } from '@/types'

export function MessagesContent() {
  const user = useAuthStore((s) => s.user)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/backend/conversations', {
          credentials: 'include',
        })
        if (!response.ok) throw new Error('Konuşmalar yüklenemedi')
        const data = await response.json()
        setConversations(data)
      } catch (err) {
        console.error('[messages]', err)
        setError('Konuşmalar yüklenirken hata oluştu')
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [])

  if (isLoading) {
    return (
      <div className="container-content py-xl">
        <div className="text-center">
          <p className="text-text-sub">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-content py-xl">
        <div className="text-center">
          <p className="text-red-500 mb-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary font-semibold hover:underline"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="container-content py-xl">
        <div className="text-center py-2xl">
          <MessageCircle size={48} className="mx-auto mb-md text-text-mute opacity-50" />
          <h1 className="text-2xl font-bold mb-md">Henüz Konuşma Yok</h1>
          <p className="text-text-sub mb-lg">
            Deneyim paylaşımlarında &quot;Soru Sor&quot; butonuyla konuşma başlatabilirsin.
          </p>
          <Link href="/" className="text-primary font-semibold hover:underline">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-content py-xl">
      <h1 className="text-[28px] font-extrabold tracking-tight mb-2xl">Mesajlar</h1>

      <div className="space-y-2 max-w-2xl mx-auto">
        {conversations.map((conv) => {
          const unread = user ? isConversationUnread(conv, user.userId) : false
          return (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className={`block p-lg rounded-lg border transition ${
                unread
                  ? 'border-primary bg-primary-light/50 hover:bg-primary-light'
                  : 'border-border bg-bg-surface hover:bg-bg-elevated'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                {unread && (
                  <span
                    aria-label="Okunmamış mesaj"
                    className="size-2.5 rounded-full bg-primary flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2
                    className={`truncate ${
                      unread ? 'font-extrabold text-text' : 'font-semibold text-text'
                    }`}
                  >
                    <span aria-hidden="true">{conv.otherUserNationalityFlag}</span>{' '}
                    {conv.otherUserName}
                  </h2>
                  <p
                    className={`text-sm mt-1 truncate ${
                      unread ? 'text-text font-semibold' : 'text-text-sub'
                    }`}
                  >
                    {conv.lastMessage || 'Konuşma başladı'}
                  </p>
                </div>
                <time className="text-xs text-text-mute ml-2 flex-shrink-0">
                  {new Date(conv.lastMessageAt).toLocaleDateString('tr-TR')}
                </time>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
