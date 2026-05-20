'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState, type FormEvent } from 'react'
import { Button, ErrorBox, Input } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell loading />}>
      <LoginForm />
    </Suspense>
  )
}

function LoginShell({ loading }: { loading?: boolean }) {
  return (
    <>
      <h1 className="mb-sm text-[28px] font-extrabold tracking-tight">Hoş Geldin</h1>
      <p className="mb-2xl text-text-sub">
        {loading ? 'Yükleniyor...' : 'Hesabına giriş yap, deneyimleri keşfet.'}
      </p>
    </>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const passwordChanged = searchParams.get('passwordChanged') === '1'

  const { login, loginPending, loginError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    if (!email.trim() || !password) {
      setLocalError('E-posta ve şifre zorunludur.')
      return
    }
    try {
      await login({ email: email.trim(), password })
      router.replace(next)
    } catch {
      // useAuth.loginError otomatik dolar
    }
  }

  return (
    <>
      <h1 className="mb-sm text-[28px] font-extrabold tracking-tight">Hoş Geldin</h1>
      <p className="mb-2xl text-text-sub">Hesabına giriş yap, deneyimleri keşfet.</p>

      {passwordChanged && (
        <div className="mb-lg rounded-xl border border-success bg-success/10 px-lg py-md text-sm text-success font-semibold">
          ✓ Şifren güncellendi. Lütfen yeni şifrenle tekrar giriş yap.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="E-posta"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@mail.com"
        />
        <Input
          label="Şifre"
          type="password"
          autoComplete="current-password"
          required
          minLength={1}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <ErrorBox message={localError ?? loginError} />

        <Button type="submit" fullWidth isLoading={loginPending} className="mt-lg">
          Giriş Yap
        </Button>
      </form>

      <div className="mt-xl flex flex-col items-center gap-md text-center">
        <p className="text-text-sub">
          Hesabın yok mu?{' '}
          <Link href="/register" className="font-bold text-primary hover:underline">
            Kayıt Ol
          </Link>
        </p>
        <Link
          href="/forgot-password"
          className="text-[13px] text-text-mute hover:text-primary"
        >
          Şifreni mi unuttun?{' '}
          <span className="font-bold text-primary">Sıfırla</span>
        </Link>
      </div>
    </>
  )
}
