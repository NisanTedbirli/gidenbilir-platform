/**
 * /profile/me — cookie'den userId okuyup gerçek /profile/[userId] sayfasına yönlendirir.
 *
 * NOT: Next.js'in redirect()'i internal olarak NEXT_REDIRECT throw eder.
 * Bu yüzden try/catch İÇİNDE redirect çağırmıyoruz — parse hatasını ayrı yakalıyoruz.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AUTH_USER_COOKIE_NAME } from '@/lib/auth'

export default async function MyProfilePage() {
  const cookieStore = await cookies()
  const userJson = cookieStore.get(AUTH_USER_COOKIE_NAME)?.value

  if (!userJson) {
    redirect('/login?next=/profile/me')
  }

  let userId: number | null = null
  try {
    const parsed = JSON.parse(userJson) as Record<string, unknown>
    // Hem camelCase hem PascalCase'i tolere et (cookie eski yazımdan kalmış olabilir)
    const raw = parsed.userId ?? parsed.UserId
    const num = typeof raw === 'number' ? raw : Number(raw)
    if (Number.isFinite(num) && num > 0) {
      userId = num
    }
  } catch {
    userId = null
  }

  if (!userId) {
    redirect('/login?next=/profile/me')
  }

  redirect(`/profile/${userId}`)
}
