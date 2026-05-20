import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GidenBilir — Seyahat Deneyimleri',
    short_name: 'GidenBilir',
    description: 'Gerçek seyahatçilerden, kültürel bakış açısıyla filtrelenmiş seyahat deneyimleri.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff9f5',
    theme_color: '#ff6b35',
    orientation: 'portrait',
    lang: 'tr',
    icons: [
      // TODO: public/ dizinine icon-192.png, icon-512.png ekle
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
  }
}
