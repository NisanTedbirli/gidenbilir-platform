/**
 * Auth utilities — JWT cookie yönetimi (web-spesifik).
 * Mobile AsyncStorage yerine Next.js cookie API'si kullanır.
 *
 * NOT: Bu dosya Sprint 1'de Next.js Server Actions ile genişletilecek.
 * Şu an sadece cookie name sabitleri ve client-side helper'lar.
 */

export const AUTH_COOKIE_NAME = 'gb_token'
export const AUTH_USER_COOKIE_NAME = 'gb_user'

// Cookie config (Sprint 1'de Server Action'da kullanılacak)
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 gün — backend JWT süresiyle eşleşir
}

/**
 * Client-side: cookie'den user bilgisini oku (httpOnly olmayan user cookie).
 * Token kendisi httpOnly olduğu için client tarafından okunamaz.
 */
export function readUserCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(^| )${AUTH_USER_COOKIE_NAME}=([^;]+)`))
  return match ? decodeURIComponent(match[2] ?? '') : null
}
