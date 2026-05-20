'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { markConversationRead } from '@/hooks/useUnreadMessages'
import type { Message } from '@/types'

interface ChatDetailProps {
  conversationId: string
}

interface ConversationDetail {
  id: number
  otherUserName: string
  otherUserNationalityFlag: string
  messages?: Message[]
}

export function ChatDetail({ conversationId }: ChatDetailProps) {
  const [conversation, setConversation] = useState<ConversationDetail | null>(null)
  const [messageText, setMessageText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const user = useAuthStore((state) => state.user)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // SignalR gerçek zamanlı mesaj dinleyicisi — lazy loaded (bundle optimizasyon)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let conn: any = null

    const setup = async () => {
      try {
        const { createChatConnection } = await import('@/lib/signalr')
        conn = createChatConnection()
        await conn.start()
        await conn.invoke('JoinConversation', conversationId)

        conn.on('ReceiveMessage', (msg: Message) => {
          setConversation((prev) => {
            if (!prev) return null
            // Kendi gönderdiğimiz mesajı tekrar ekleme
            if (prev.messages?.some((m) => m.id === msg.id)) return prev
            return { ...prev, messages: [...(prev.messages ?? []), msg] }
          })
        })
      } catch (err) {
        console.warn('[signalr] bağlantı kurulamadı:', err)
      }
    }

    setup()

    return () => {
      if (conn) {
        conn.invoke('LeaveConversation', conversationId).catch(() => {})
        conn.stop()
      }
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  // Konuşma açıldığında ve mesajlar geldiğinde okundu işaretle
  useEffect(() => {
    const numId = Number(conversationId)
    if (Number.isFinite(numId) && numId > 0) {
      markConversationRead(numId)
    }
  }, [conversationId, conversation?.messages])

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        // Fetch messages first (always works if conversation exists)
        const msgsRes = await fetch(
          `/api/backend/conversations/${conversationId}/messages`,
          { credentials: 'include' }
        )

        if (!msgsRes.ok) {
          throw new Error(`Mesajlar yüklenemedi: ${msgsRes.status}`)
        }

        const messagesData = await msgsRes.json()

        // Try to get conversation details from list
        let conv: ConversationDetail | null = null
        try {
          const convsRes = await fetch('/api/backend/conversations', {
            credentials: 'include',
          })
          if (convsRes.ok) {
            const conversations = (await convsRes.json()) as ConversationDetail[]
            conv = conversations.find((c) => c.id === parseInt(conversationId)) || null
          }
        } catch {
          // Conversations list failed, but we have messages — continue with fallback
          console.warn('[chat-detail] Conversations list unavailable, using fallback')
        }

        if (conv) {
          // Use conversation details from list
          setConversation({
            id: conv.id,
            otherUserName: conv.otherUserName,
            otherUserNationalityFlag: conv.otherUserNationalityFlag,
            messages: messagesData.items || [],
          })
        } else {
          // Fallback: construct conversation from first message
          const firstMsg = messagesData.items?.[0]
          const otherUserName = firstMsg?.senderId === user?.userId ? 'Unknown' : firstMsg?.senderName || 'Unknown'

          setConversation({
            id: parseInt(conversationId),
            otherUserName: otherUserName,
            otherUserNationalityFlag: '🌍',
            messages: messagesData.items || [],
          })
        }
      } catch (err) {
        console.error('[chat-detail]', err)
        setError('Konuşma yüklenirken hata oluştu')
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversation()
  }, [conversationId, user?.userId])

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/backend/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: messageText }),
      })

      if (!response.ok) throw new Error('Mesaj gönderilemedi')
      const newMessage = await response.json()

      setConversation((prev) => {
        if (!prev) return null
        return {
          ...prev,
          messages: [...(prev.messages || []), newMessage],
        }
      })
      setMessageText('')
    } catch (err) {
      console.error('[send-message]', err)
      alert('Mesaj gönderilemedi')
    } finally {
      setIsSending(false)
    }
  }

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm('Mesajı sil?')) return

    try {
      const response = await fetch(
        `/api/backend/conversations/${conversationId}/messages/${messageId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      if (!response.ok) throw new Error('Mesaj silinemedi')

      setConversation((prev) => {
        if (!prev) return null
        return {
          ...prev,
          messages: (prev.messages ?? []).filter((m) => m.id !== messageId),
        }
      })
    } catch (err) {
      console.error('[delete-message]', err)
      alert('Mesaj silinemedi')
    }
  }

  if (isLoading) {
    return <div className="text-center py-2xl text-text-sub">Yükleniyor...</div>
  }

  if (error || !conversation) {
    return (
      <div className="text-center py-2xl">
        <p className="text-red-500 mb-md">{error || 'Konuşma bulunamadı'}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary font-semibold hover:underline"
        >
          Tekrar Dene
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px] bg-bg-surface rounded-lg border border-border">
      {/* Header */}
      <div className="px-lg py-md border-b border-border">
        <h1 className="font-semibold text-text flex items-center gap-2">
          <span aria-hidden="true">{conversation.otherUserNationalityFlag}</span>
          {conversation.otherUserName}
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-lg space-y-md">
        {!conversation.messages || conversation.messages.length === 0 ? (
          <div className="text-center text-text-mute py-2xl">Henüz mesaj yok</div>
        ) : (
          conversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.senderId === user?.userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-lg py-md rounded-lg ${
                  msg.senderId === user?.userId
                    ? 'bg-primary text-white'
                    : 'bg-bg-elevated text-text'
                }`}
              >
                <p className="text-sm break-words">{msg.content}</p>
                <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
                  <time>{new Date(msg.createdAt).toLocaleTimeString('tr-TR')}</time>
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="hover:opacity-100 opacity-70 transition"
                    title="Mesajı sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-lg flex gap-2">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          placeholder="Mesajını yaz..."
          className="flex-1 px-lg py-md rounded-lg bg-bg-surface border border-border text-text focus:border-primary focus:outline-none"
        />
        <button
          onClick={handleSendMessage}
          disabled={!messageText.trim() || isSending}
          className="px-lg py-md rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition disabled:opacity-50 flex items-center gap-2"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
