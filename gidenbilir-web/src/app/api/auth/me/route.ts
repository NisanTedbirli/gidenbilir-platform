/**
 * GET /api/auth/me
 * Mevcut session'u doğrula. 401 ise cookie ve localStorage temizlenmesi gerekiyor.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME, AUTH_USER_COOKIE_NAME } from '@/lib/auth'
import type { AuthUser } from '@/types'

const BACKEND_URL = process.env.API_URL ?? 'http://localhost:5208'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.json({ message: 'Token bulunamadı.' }, { status: 401 })
  }

  try {
    const upstream = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!upstream.ok) {
      // Session invalid — cookie'leri temizle
      const res = NextResponse.json(
        { message: 'Session geçersiz.' },
        { status: 401 },
      )
      res.cookies.delete(AUTH_COOKIE_NAME)
      res.cookies.delete(AUTH_USER_COOKIE_NAME)
      return res
    }

    const data = (await upstream.json()) as AuthUser
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { token: _, ...userPublic } = data

    const res = NextResponse.json(userPublic)

    // User cookie'sini güncelle (meta değişmiş olabilir)
    res.cookies.set(AUTH_USER_COOKIE_NAME, JSON.stringify(userPublic), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    return res
  } catch (err) {
    console.error('[auth/me] backend error:', err)
    return NextResponse.json(
      { message: 'Sunucuya bağlanılamadı.' },
      { status: 503 },
    )
  }
}
