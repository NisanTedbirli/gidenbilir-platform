'use client'

import Link from 'next/link'

/**
 * Şifre sıfırlama — backend'de henüz endpoint yok.
 * Placeholder: e-posta alıyor, "kontrol et" mesajı gösteriyor.
 * Backend'e endpoint eklendiğinde gerçek API çağrısı buraya entegre edilecek.
 */
export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-sm text-[28px] font-extrabold tracking-tight">Şifreni mi Unuttun?</h1>
      <p className="mb-2xl text-text-sub">
        Bu özellik yakında eklenecek. Şimdilik destek ekibi ile iletişime geç.
      </p>

      <div className="mb-xl rounded-2xl border border-border bg-bg-elevated p-lg">
        <p className="text-[15px] text-text-sub mb-md">
          Şifrenizi sıfırlamak için lütfen:
        </p>
        <ul className="space-y-sm text-[15px] text-text-sub list-disc list-inside">
          <li>Destek ekibine e-posta gönder</li>
          <li>Hesabınıza giriş yapamıyorsanız destek isteyebilirsin</li>
        </ul>
      </div>

      <Link
        href="/login"
        className="block text-center font-bold text-primary hover:underline"
      >
        ← Giriş ekranına dön
      </Link>
    </>
  )
}
