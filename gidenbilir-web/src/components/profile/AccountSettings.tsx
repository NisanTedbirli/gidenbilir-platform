'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AlertTriangle, KeyRound, UserCog } from 'lucide-react'
import {
  changePassword,
  deleteAccount,
  getNationalities,
  updateProfile,
} from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { Button, ErrorBox, Input } from '@/components/ui'
import type { Nationality } from '@/types'

export function AccountSettings() {
  return (
    <div className="space-y-2xl max-w-2xl">
      <ProfileEditSection />
      <PasswordChangeSection />
      <DeleteAccountSection />
    </div>
  )
}

function SectionCard({
  icon,
  title,
  description,
  children,
  danger,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <section
      className={`rounded-2xl border p-xl shadow-sm ${
        danger
          ? 'border-danger-light bg-danger-light/30'
          : 'border-border bg-bg-surface'
      }`}
    >
      <div className="mb-lg flex items-center gap-md">
        <div
          className={`flex size-10 items-center justify-center rounded-full ${
            danger ? 'bg-danger text-white' : 'bg-primary-light text-primary'
          }`}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-[18px] font-bold text-text">{title}</h2>
          <p className="text-[13px] text-text-sub">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

// === Profil bilgilerini güncelle ===
function ProfileEditSection() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [nationalityId, setNationalityId] = useState<number | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: nationalities = [] } = useQuery({
    queryKey: ['nationalities'],
    queryFn: async () => {
      const res = await getNationalities()
      const list = res.data
      // İlk yüklemede mevcut milliyeti seç
      if (nationalityId === null && user) {
        const match = list.find((n: Nationality) => n.code === user.nationalityCode)
        if (match) setNationalityId(match.id)
      }
      return list
    },
  })

  const mutation = useMutation({
    mutationFn: () => updateProfile({ fullName: fullName.trim(), nationalityId: nationalityId! }),
    onSuccess: (res) => {
      setUser({ ...res.data, token: '' })
      setSuccess(true)
      setError(null)
      setTimeout(() => setSuccess(false), 3000)
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? null)
          : null
      setError(message ?? 'Profil güncellenemedi.')
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || nationalityId === null) {
      setError('Tüm alanlar zorunludur.')
      return
    }
    setError(null)
    mutation.mutate()
  }

  return (
    <SectionCard
      icon={<UserCog size={18} />}
      title="Profil Bilgileri"
      description="Adınızı ve milliyetinizi güncelleyin."
    >
      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Ad Soyad"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <div className="mb-md">
          <label
            htmlFor="settings-nationality"
            className="mb-xs block text-[12px] font-bold uppercase tracking-wider text-text-sub"
          >
            Milliyet
          </label>
          <select
            id="settings-nationality"
            value={nationalityId ?? ''}
            onChange={(e) => setNationalityId(Number(e.target.value))}
            className="w-full rounded-2xl border-[1.5px] border-border bg-bg-surface px-lg py-[14px] text-[15px] text-text focus:border-primary focus:outline-none"
          >
            <option value="">Milliyet seçin...</option>
            {nationalities.map((n: Nationality) => (
              <option key={n.id} value={n.id}>
                {n.flagEmoji} {n.name}
              </option>
            ))}
          </select>
        </div>

        <ErrorBox message={error} />
        {success && (
          <p className="mb-md text-success text-sm font-bold">
            ✓ Profil güncellendi.
          </p>
        )}

        <Button type="submit" isLoading={mutation.isPending}>
          Değişiklikleri Kaydet
        </Button>
      </form>
    </SectionCard>
  )
}

// === Şifre değiştir ===
function PasswordChangeSection() {
  const router = useRouter()
  const logoutStore = useAuthStore((s) => s.logout)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => changePassword({ currentPassword, newPassword }),
    onSuccess: async () => {
      // Güvenlik için: şifre değişince oturumu kapat ve girişe yönlendir
      try {
        await fetch('/api/auth/logout', { method: 'POST' })
      } catch {
        // ignore
      }
      logoutStore()
      router.replace('/login?passwordChanged=1')
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? null)
          : null
      setError(message ?? 'Şifre değiştirilemedi.')
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!currentPassword || !newPassword) {
      setError('Tüm alanlar zorunludur.')
      return
    }
    if (newPassword.length < 8) {
      setError('Yeni şifre en az 8 karakter olmalıdır.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Yeni şifreler eşleşmiyor.')
      return
    }
    mutation.mutate()
  }

  return (
    <SectionCard
      icon={<KeyRound size={18} />}
      title="Şifre Değiştir"
      description="Hesabınızı güvende tutmak için düzenli olarak güncelleyin."
    >
      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Mevcut Şifre"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <Input
          label="Yeni Şifre (min 8 karakter)"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
        />
        <Input
          label="Yeni Şifre (tekrar)"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />

        <ErrorBox message={error} />
        <p className="mb-md text-[12px] text-text-sub">
          Şifre değiştikten sonra güvenlik için tekrar giriş yapmanız istenecek.
        </p>

        <Button type="submit" isLoading={mutation.isPending}>
          Şifreyi Değiştir
        </Button>
      </form>
    </SectionCard>
  )
}

// === Hesabı sil ===
function DeleteAccountSection() {
  const router = useRouter()
  const logoutStore = useAuthStore((s) => s.logout)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => deleteAccount({ password }),
    onSuccess: async () => {
      await fetch('/api/auth/logout', { method: 'POST' })
      logoutStore()
      router.replace('/login')
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? null)
          : null
      setError(message ?? 'Hesap silinemedi.')
    },
  })

  return (
    <SectionCard
      icon={<AlertTriangle size={18} />}
      title="Hesabı Kapat"
      description="Hesabınız ve tüm verileriniz kalıcı olarak silinir. Bu işlem geri alınamaz."
      danger
    >
      {!showConfirm ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="px-lg py-md rounded-xl bg-danger text-white font-bold hover:brightness-110 transition"
        >
          Hesabımı Kapat
        </button>
      ) : (
        <div className="space-y-md">
          <p className="text-[14px] text-text font-semibold">
            Onaylamak için mevcut şifrenizi girin:
          </p>
          <Input
            label="Şifre"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <ErrorBox message={error} />
          <div className="flex gap-md flex-wrap">
            <button
              type="button"
              onClick={() => {
                setShowConfirm(false)
                setPassword('')
                setError(null)
              }}
              disabled={mutation.isPending}
              className="px-lg py-md rounded-xl bg-bg-elevated text-text font-bold hover:bg-border transition disabled:opacity-50"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={() => {
                if (!password) {
                  setError('Şifre zorunludur.')
                  return
                }
                setError(null)
                mutation.mutate()
              }}
              disabled={mutation.isPending}
              className="px-lg py-md rounded-xl bg-danger text-white font-bold hover:brightness-110 transition disabled:opacity-50"
            >
              {mutation.isPending ? 'Siliniyor...' : 'Evet, hesabımı sil'}
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  )
}
