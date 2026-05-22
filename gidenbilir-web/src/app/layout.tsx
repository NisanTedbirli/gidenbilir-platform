import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sans',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gidenbilir-platform-xvyj.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'GidenBilir - Seyahat Deneyimleri',
    template: '%s - GidenBilir',
  },
  description: 'Gercek seyahatcilerden kulturel bakis acisiyla filtrelenmis seyahat deneyimleri. Gidenden ogren.',
  keywords: ['seyahat', 'deneyim', 'gezi', 'tatil', 'kultur', 'GidenBilir'],
  authors: [{ name: 'GidenBilir' }],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'GidenBilir',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body>
        <a href="#main-content" className="skip-link">
          Iceriye atla
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
