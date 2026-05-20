/**
 * Next.js Middleware — Route Protection.
 *
 * Davranış:
 *   - / , /discover, /share, /profile/* → auth gerekli, yoksa /login
 *   - /experiences/[id] → auth opsiyonel (SEO için public)
 *   - /login, /register, /forgot-password → giriş yapmışken /'a redirect
 */
import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/lib/auth'

const AUTH_PAGES = ['/login', '/register', '/forgot-password']
const PROTECTED_PREFIXES = ['/share', '/profile']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value

  // 1. Auth sayfaları + zaten giriş yapmış → ana sayfaya dön
  if (AUTH_PAGES.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // 2. Korunan sayfalar + token yok → login'e
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  if (isProtected && !token) {
    const url = new URL('/login', req.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // 3. Ana sayfa (feed) — auth gerekli (Sprint 1 kararı, Sprint 2'de feed read-only olabilir)
  if (pathname === '/' && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  // Static asset, _next, ve api/backend/* hariç tüm sayfaları yakala
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/).*)'],
}
