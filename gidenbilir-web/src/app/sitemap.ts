import type { MetadataRoute } from 'next'

/**
 * Sitemap — statik sayfalar + (gelecekte) deneyim listesinden dinamik URL'ler.
 * Production'da backend'e ID listesi endpoint'i ekleyince expand edilecek.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/discover`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // TODO: production'a açılınca backend'e GET /api/experiences/ids endpoint'i
  // ekleyip dinamik experience URL'lerini buraya append et.

  return staticRoutes
}
