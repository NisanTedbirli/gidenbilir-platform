/**
 * Backend proxy — /api/backend/* isteklerini backend'e iletir.
 * Cookie'deki JWT'yi Authorization header'a çevirir.
 *
 * Bu yaklaşım Next.js rewrite yerine kullanılır çünkü:
 *   1. Cookie → Authorization header dönüşümünü merkezi yapar
 *   2. Client tarafında token expose edilmez (httpOnly korunur)
 *   3. CORS sorunu olmaz (aynı origin)
 */
import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/lib/auth'

const BACKEND_URL = process.env.API_URL ?? 'http://localhost:5208'

async function proxy(req: NextRequest, params: { path: string[] }) {
  const path = params.path.join('/')
  const search = req.nextUrl.search
  const target = `${BACKEND_URL}/api/${path}${search}`

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
  const headers = new Headers(req.headers)
  headers.delete('host')
  headers.delete('cookie')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
  const body = hasBody ? await req.arrayBuffer() : undefined

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
      cache: 'no-store',
    })

    const responseHeaders = new Headers(upstream.headers)
    responseHeaders.delete('access-control-allow-origin')
    responseHeaders.delete('access-control-allow-credentials')

    const responseBody = await upstream.arrayBuffer()
    return new NextResponse(responseBody, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    })
  } catch (err) {
    console.error(`[backend-proxy] ${req.method} ${target}`, err)
    return NextResponse.json({ message: 'Sunucuya bağlanılamadı.' }, { status: 503 })
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params)
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params)
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params)
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params)
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params)
}
