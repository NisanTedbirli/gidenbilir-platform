/**
 * /profile/[userId] — Kullanıcı profil sayfası.
 * Owner ise: stats + paylaşımlar (sil/düzenle) + hesap ayarları.
 * Başka kullanıcıysa: sadece stats + paylaşımlar (read-only).
 */
import { ProfileView } from '@/components/profile/ProfileView'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const numId = Number(userId)

  if (!Number.isFinite(numId) || numId <= 0) {
    return (
      <div className="container-content py-xl">
        <p className="text-text-sub">Geçersiz kullanıcı.</p>
      </div>
    )
  }

  return <ProfileView userId={numId} />
}
