'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Button, ErrorBox, Input } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useNationalities } from '@/hooks/useLookups'

export default function RegisterPage() {
  const router = useRouter()
  const { register, registerPending, registerError } = useAuth()
  const { data: nationalities = [], isLoading: natLoading } = useNationalities()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedNatId, setSelectedNatId] = useState<number | null>(null)
  const [natSearch, setNatSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = natSearch.trim().toLocaleLowerCase('tr')
    if (!q) return nationalities
    return nationalities.filter((n) => n.name.toLocaleLowerCase('tr').includes(q))
  }, [nationalities, natSearch])

  const selected = nationalities.find((n) => n.id === selectedNatId) ?? null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    if (!fullName.trim()) return setLocalError('Ad Soyad zorunludur.')
    if (!email.trim()) return setLocalError('E-posta zorunludur.')
    if (password.length < 8) return setLocalError('Şifre en az 8 karakter olmalıdır.')
    if (!selectedNatId) return setLocalError('Milliyetinizi seçiniz.')

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        nationalityId: selectedNatId,
      })
      router.replace('/')
    } catch {
      // registerError otomatik dolar
    }
  }

  return (
    <>
      <h1 className="mb-sm text-[28px] font-extrabold tracking-tight">Hesap Oluştur</h1>
      <p className="mb-2xl text-text-sub">Deneyimlerini dünyayla paylaş.</p>

      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Ad Soyad"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Adın Soyadın"
        />
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
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="En az 8 karakter"
          hint="Şifreniz en az 8 karakter olmalıdır."
        />

        {/* Milliyet seçici */}
        <div className="mb-md">
          <label
            htmlFor="nationality-search"
            className="mb-xs block text-[12px] font-bold uppercase tracking-wider text-text-sub"
          >
            Milliyet
          </label>

          {selected ? (
            <button
              type="button"
              onClick={() => {
                setSelectedNatId(null)
                setShowDropdown(true)
              }}
              className="flex w-full items-center justify-between rounded-2xl border-[1.5px] border-primary bg-primary-light px-lg py-[14px] text-left transition hover:brightness-95"
              aria-label={`Seçili milliyet: ${selected.name}. Değiştirmek için tıkla.`}
            >
              <span className="text-[15px] font-bold text-primary">
                <span aria-hidden="true">{selected.flagEmoji}</span> {selected.name}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wide text-primary/70">
                Değiştir
              </span>
            </button>
          ) : (
            <div className="relative">
              <input
                ref={inputRef}
                id="nationality-search"
                type="text"
                value={natSearch}
                onChange={(e) => {
                  setNatSearch(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Milliyet ara... (örn: Türk, Alman)"
                className="w-full rounded-2xl border-[1.5px] border-border bg-bg-surface px-lg py-[14px] text-[15px] text-text placeholder:text-text-mute focus:border-primary focus:outline-none"
                role="combobox"
                aria-expanded={showDropdown}
                aria-controls="nationality-listbox"
                aria-autocomplete="list"
              />
              {showDropdown && (
                <ul
                  id="nationality-listbox"
                  role="listbox"
                  style={{
                    position: 'fixed',
                    top: (inputRef.current?.getBoundingClientRect().bottom ?? 0) + 4,
                    left: inputRef.current?.getBoundingClientRect().left ?? 0,
                    width: inputRef.current?.getBoundingClientRect().width ?? 'auto',
                    zIndex: 9999,
                  }}
                  className="max-h-60 overflow-y-auto rounded-2xl border border-border bg-bg-surface shadow-lg"
                >
                  {natLoading ? (
                    <li className="px-lg py-md text-center text-[13px] text-text-sub">
                      Yükleniyor...
                    </li>
                  ) : filtered.length === 0 ? (
                    <li className="px-lg py-md text-center text-[13px] text-text-sub">
                      Sonuç yok
                    </li>
                  ) : (
                    filtered.map((n) => (
                      <li key={n.id} role="option" aria-selected={false}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedNatId(n.id)
                            setNatSearch('')
                            setShowDropdown(false)
                            setLocalError(null)
                          }}
                          className="flex w-full items-center gap-md border-b border-border px-lg py-3 text-left text-[15px] hover:bg-bg-elevated"
                        >
                          <span className="text-xl" aria-hidden="true">
                            {n.flagEmoji}
                          </span>
                          <span className="font-medium">{n.name}</span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          )}
        </div>

        <ErrorBox message={localError ?? registerError} />

        <Button
          type="submit"
          fullWidth
          isLoading={registerPending}
          disabled={natLoading}
          className="mt-md"
        >
          Hesap Oluştur
        </Button>
      </form>

      <p className="mt-xl text-center text-text-sub">
        Zaten hesabın var mı?{' '}
        <Link href="/login" className="font-bold text-primary hover:underline">
          Giriş Yap
        </Link>
      </p>
    </>
  )
}
