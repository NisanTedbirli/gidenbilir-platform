import * as signalR from '@microsoft/signalr'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5208'

async function getSignalRToken(): Promise<string> {
  const res = await fetch('/api/auth/signalr-token')
  if (!res.ok) throw new Error('SignalR token alınamadı')
  const { token } = (await res.json()) as { token: string }
  return token
}

export function createChatConnection(): signalR.HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${BACKEND_URL}/hubs/chat`, {
      accessTokenFactory: getSignalRToken,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build()
}
