import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-2xl bg-bg">
      <div className="max-w-md text-center">
        <div className="text-7xl mb-md" aria-hidden="true">🌍</div>
        <h1 className="text-[28px] font-extrabold tracking-tight mb-sm text-text">
          Sayfa bulunamadı
        </h1>
        <p className="text-text-sub mb-lg">
          Aradığın sayfa burada değil. Belki seyahate çıkmıştır.
        </p>
        <Link
          href="/"
          className="inline-block px-lg py-md rounded-xl bg-primary text-white font-bold hover:brightness-110 transition"
        >
          Ana sayfaya dön
        </Link>
      </div>
    </div>
  )
}
