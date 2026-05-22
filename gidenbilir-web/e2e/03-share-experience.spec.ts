import { test, expect } from './fixtures'

test.describe('Deneyim paylaş', () => {
  test('3 adımlı wizard ile deneyim paylaşılır', async ({ authPage: page }) => {
    await page.goto('/share')
    await expect(page.getByText('Adım 1')).toBeVisible()

    // Adım 1 — Ülke seç
    await page.getByPlaceholder('Ülke seçin').click()
    await page.getByPlaceholder('Ülke seçin').fill('Türkiye')
    await page.getByText('Türkiye').first().click()
    await page.getByRole('button', { name: 'İleri' }).click()

    // Adım 2 — Hikaye
    await expect(page.getByText('Adım 2')).toBeVisible()
    await page.getByPlaceholder('Kısa, dikkat çekici bir başlık').fill('E2E Test Deneyimi')
    await page.getByPlaceholder('Deneyimini detaylıca anlat').fill('Bu bir otomatik E2E testi deneyimidir. Minimum 10 karakter.')

    // Kategori seç
    await page.locator('button').filter({ hasText: 'Yemek' }).first().click()

    // Puan ver
    await page.locator('button[aria-label*="puan"]').nth(3).click()

    await page.getByRole('button', { name: 'İleri' }).click()

    // Adım 3 — Fotoğraf (opsiyonel, geç)
    await expect(page.getByText('Adım 3')).toBeVisible()
    await page.getByRole('button', { name: 'Paylaş' }).click()

    // Başarılı — deneyim detayına yönlendirmeli
    await expect(page).toHaveURL(/\/experiences\/\d+/)
  })
})
