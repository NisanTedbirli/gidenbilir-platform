# GidenBilir Web

GidenBilir seyahat deneyim paylaşım platformunun web versiyonu. Mobil uygulamayla aynı backend API'sini tüketir, desktop-optimize bir tasarımla.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript strict
- **Styling:** Tailwind CSS + CSS custom properties (design tokens)
- **State:** Zustand (auth) + TanStack Query (server state)
- **Form:** React Hook Form + Zod
- **HTTP:** axios
- **Test:** Vitest + Testing Library + Playwright
- **A11y:** WCAG 2.1 AA hedefli, axe-core ile sürekli denetim

## Setup

```bash
# Bağımlılıkları yükle
npm install

# .env.local oluştur
cp .env.example .env.local
# NEXT_PUBLIC_API_URL'i kendi backend'inize göre düzenleyin

# Backend'i başlat (ayrı terminal)
cd ../backend/Perspektif.API
dotnet run

# Web dev server'ı başlat
npm run dev
# http://localhost:3000
```

## Komutlar

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run typecheck    # TypeScript strict check
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright E2E
npm run format       # Prettier
```

## Klasör Yapısı

```
src/
├── app/              # Next.js App Router pages
├── components/       # UI komponentler (Sprint 1+'da dolacak)
├── hooks/            # React hooks (useLookups, useAuth, vs.)
├── lib/              # API client, utilities
│   ├── api.ts        # Backend API client (axios)
│   ├── auth.ts       # JWT cookie utilities
│   ├── cities.ts     # Statik şehir listesi
│   ├── cn.ts         # className helper (clsx + twMerge)
│   └── dateUtils.ts  # dayjs helpers
├── stores/           # Zustand stores
├── styles/
│   ├── tokens.css    # Design tokens (CSS custom properties)
│   └── globals.css   # Global styles + Tailwind
└── types/            # TypeScript tip tanımları
```

## Sprint Durumu

| Sprint | Konu | Durum |
|--------|------|-------|
| 0 | Foundation (config, tokens, API client, providers) | ✅ |
| 1 | Auth + Layout (sidebar, login, register, middleware) | ⏳ |
| 2 | Feed + Detail (SSR, infinite scroll, gallery, comments) | ⏳ |
| 3 | Discover + Share (filtreler, 3-step wizard, photo upload) | ⏳ |
| 4 | Profile + Polish (stats, edit/delete, SEO, deploy) | ⏳ |

## Agent Ekibi

Bu proje [agents/web-tasarim-lider](../../agents/web-tasarim-lider) koordinasyonunda çalışır:

- **web-tasarimci** — UI komponent tasarımı, layout, CSS
- **design-system-mimarisi** — Token sistemi, theming, Storybook
- **frontend-gelistirici** — React/Next.js implementation, performans
- **erisilebilirlik-uzmani** — WCAG denetimi, ARIA, klavye nav

## Mobil ile İlişki

Bu proje `mobile/perspektif/` ile **paylaşır:**
- Backend API'si
- Design token değerleri (renkler, tipografi, spacing)
- Statik veriler (cities.ts)
- Tarih formatlama mantığı

**Paylaşmaz** (web-spesifik):
- Routing (Next.js App Router vs. React Navigation)
- Storage (cookie vs. AsyncStorage)
- Komponent kodu (HTML vs. React Native)
- Image upload (File API vs. ImagePicker)

## Backend Bağlantısı

Backend dev'de `http://localhost:5000` adresinde çalışır. Web, Next.js rewrite üzerinden `/api/backend/*` → backend `/api/*`'e proxy yapar (CORS sorununu önler).

Production'da `NEXT_PUBLIC_API_URL` ortam değişkenini gerçek backend URL'sine ayarlayın.

## Auth Modeli

JWT token, mobil uygulamadan farklı olarak **httpOnly cookie**'de saklanır:

- ✅ XSS koruması (JavaScript cookie'yi okuyamaz)
- ✅ Otomatik gönderim (`withCredentials: true`)
- ✅ SSR uyumlu (Server Components middleware'den okuyabilir)

Sprint 1'de Next.js Server Action ile login/register endpoint'leri yazılacak; bunlar token alıp httpOnly cookie set edecek.

## Plan

Detaylı plan: `C:\Users\HP Victus\.claude\plans\gidenbilir-uygulamas-n-n-web-site-twinkling-karp.md`
