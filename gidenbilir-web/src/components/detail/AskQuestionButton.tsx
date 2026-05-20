'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

interface AskQuestionButtonProps {
  authorId: number
  authorName: string
}

export function AskQuestionButton({ authorId, authorName }: AskQuestionButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return (
      <button
        onClick={() => router.push('/login')}
        className="w-full flex items-center justify-center gap-2 py-md px-lg rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition"
      >
        <MessageCircle size={18} />
        Giriş Yap ve Soru Sor
      </button>
    )
  }

  if (user.userId === authorId) {
    return null
  }

  const handleAskQuestion = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/backend/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ participantId: authorId }),
      })

      if (!response.ok) throw new Error('Konuşma başlatılamadı')
      const { id } = await response.json()
      router.push(`/messages/${id}`)
    } catch (error) {
      console.error('[ask-question]', error)
      alert('Hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleAskQuestion}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 py-md px-lg rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition disabled:opacity-50"
    >
      <MessageCircle size={18} />
      {isLoading ? 'Yükleniyor...' : `${authorName}'e Soru Sor`}
    </button>
  )
}
