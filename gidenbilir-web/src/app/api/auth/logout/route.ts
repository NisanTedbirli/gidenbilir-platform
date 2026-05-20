/**
 * POST /api/auth/logout
 * Cookie'leri temizler. Backend tarafı stateless JWT olduğu için server'a istek gerekmez.
 */
import { NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME, AUTH_USER_COOKIE_NAME } from '@/lib/auth'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete(AUTH_COOKIE_NAME)
  res.cookies.delete(AUTH_USER_COOKIE_NAME)
  return res
}
