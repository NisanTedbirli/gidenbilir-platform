import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'GidenBilir — Seyahat Deneyimleri',
    template: '%s · GidenBilir',
  },
  description:
    'Gerçek seyahatçilerden, kültürel bakış açısıyla filtrelenmiş seyahat deneyimleri. İstanbul’dan Bali’ye, Tokyo’dan New York’a — gidenden öğren.',
  keywords: ['seyahat', 'deneyim', 'gezi', 'tatil', 'kültür', 'GidenBilir'],
  authors: [{ name: 'GidenBilir' }],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'GidenBilir',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body>
        <a href="#main-content" className="skip-link">
          İçeriğe atla
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
