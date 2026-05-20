import Link from 'next/link'
import { ChatDetail } from '@/components/messages/ChatDetail'

interface ChatPageProps {
  params: Promise<{ conversationId: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { conversationId } = await params
  return (
    <div className="container-content py-xl">
      <Link
        href="/messages"
        className="text-sm font-semibold text-primary hover:underline mb-lg block"
      >
        ← Mesajlara Dön
      </Link>
      <ChatDetail conversationId={conversationId} />
    </div>
  )
}
