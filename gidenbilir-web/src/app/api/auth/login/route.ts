/**
 * POST /api/auth/login
 * Backend'e proxy yapar, dönen JWT'yi httpOnly cookie'ye yazar.
 * Client'a sadece user metadata döner (token expose edilmez).
 */
import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME, AUTH_USER_COOKIE_NAME } from '@/lib/auth'
import type { AuthUser } from '@/types'

const BACKEND_URL = process.env.API_URL ?? 'http://localhost:5208'

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Geçersiz istek.' }, { status: 400 })
  }

  const { email, password } = body
  if (!email || !password) {
    return NextResponse.json({ message: 'E-posta ve şifre zorunludur.' }, { status: 400 })
  }

  try {
    const upstream = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = (await upstream.json()) as AuthUser | { message?: string }

    if (!upstream.ok) {
      return NextResponse.json(
        { message: (data as { message?: string }).message ?? 'Giriş başarısız.' },
        { status: upstream.status },
      )
    }

    const authData = data as AuthUser
    const { token, ...userPublic } = authData

    const res = NextResponse.json(userPublic)

    // httpOnly cookie — XSS koruması
    res.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 gün
    })

    // Client-readable user cookie (sadece metadata, token YOK)
    res.cookies.set(AUTH_USER_COOKIE_NAME, JSON.stringify(userPublic), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    return res
  } catch (err) {
    console.error('[auth/login] backend error:', err)
    return NextResponse.json({ message: 'Sunucuya bağlanılamadı.' }, { status: 503 })
  }
}
