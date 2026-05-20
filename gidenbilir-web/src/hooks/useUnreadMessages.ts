'use client'

import { useQuery } from '@tanstack/react-query'
import { getConversations } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

const READ_KEY_PREFIX = 'gb_conv_read_'

export function markConversationRead(conversationId: number) {
  try {
    localStorage.setItem(
      `${READ_KEY_PREFIX}${conversationId}`,
      new Date().toISOString(),
    )
  } catch {
    // ignore
  }
}

function getReadAt(conversationId: number): number {
  try {
    const v = localStorage.getItem(`${READ_KEY_PREFIX}${conversationId}`)
    if (!v) return 0
    const t = new Date(v).getTime()
    return Number.isFinite(t) ? t : 0
  } catch {
    return 0
  }
}

/**
 * Okunmamış mesaj göstergesi.
 * Konuşma listesinde her satırın LastMessageAt + LastSenderId değerine bakar:
 * - LastSenderId benim id'm değilse VE
 * - LastMessageAt > localStorage'daki "okundu" zamanı ise → okunmamış sayılır.
 */
export function useUnreadMessageCount() {
  const user = useAuthStore((s) => s.user)

  const { data } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await getConversations()
      return res.data
    },
    enabled: !!user,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  })

  if (!user || !data) return 0

  return data.reduce((acc, c) => {
    if (c.lastSenderId == null) return acc
    if (c.lastSenderId === user.userId) return acc
    const lastAt = new Date(c.lastMessageAt).getTime()
    if (!Number.isFinite(lastAt)) return acc
    if (lastAt > getReadAt(c.id)) return acc + 1
    return acc
  }, 0)
}

export function isConversationUnread(
  conversation: { id: number; lastMessageAt: string; lastSenderId: number | null },
  currentUserId: number,
): boolean {
  if (conversation.lastSenderId == null) return false
  if (conversation.lastSenderId === currentUserId) return false
  const lastAt = new Date(conversation.lastMessageAt).getTime()
  if (!Number.isFinite(lastAt)) return false
  return lastAt > getReadAt(conversation.id)
}
