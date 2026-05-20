/**
 * POST /api/auth/register
 * Backend'e proxy, JWT'yi httpOnly cookie'ye yazar.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME, AUTH_USER_COOKIE_NAME } from '@/lib/auth'
import type { AuthUser } from '@/types'

const BACKEND_URL = process.env.API_URL ?? 'http://localhost:5208'

export async function POST(req: NextRequest) {
  let body: {
    fullName?: string
    email?: string
    password?: string
    nationalityId?: number
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Geçersiz istek.' }, { status: 400 })
  }

  const { fullName, email, password, nationalityId } = body
  if (!fullName || !email || !password || !nationalityId) {
    return NextResponse.json(
      { message: 'Tüm alanlar zorunludur.' },
      { status: 400 },
    )
  }

  if (password.length < 8) {
    return NextResponse.json(
      { message: 'Şifre en az 8 karakter olmalıdır.' },
      { status: 400 },
    )
  }

  try {
    const upstream = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, nationalityId }),
    })

    const data = (await upstream.json()) as AuthUser | { message?: string }

    if (!upstream.ok) {
      return NextResponse.json(
        { message: (data as { message?: string }).message ?? 'Kayıt başarısız.' },
        { status: upstream.status },
      )
    }

    const authData = data as AuthUser
    const { token, ...userPublic } = authData

    const res = NextResponse.json(userPublic)

    res.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    res.cookies.set(AUTH_USER_COOKIE_NAME, JSON.stringify(userPublic), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    return res
  } catch (err) {
    console.error('[auth/register] backend error:', err)
    return NextResponse.json({ message: 'Sunucuya bağlanılamadı.' }, { status: 503 })
  }
}
