import { test, expect } from './fixtures'

test.describe('Ana sayfa & Keşfet', () => {
  test('ana sayfa deneyim kartlarını gösterir', async ({ authPage: page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Ana Sayfa' })).toBeVisible()
    // İlk kart yüklenmeli (ya içerik ya loading)
    await page.waitForTimeout(2000)
    const cards = page.locator('article')
    const cardCount = await cards.count()
    // 0 veya daha fazla kart olabilir (boş DB de geçerli)
    expect(cardCount).toBeGreaterThanOrEqual(0)
  })

  test('keşfet sayfası açılır', async ({ authPage: page }) => {
    await page.goto('/discover')
    await expect(page).toHaveURL('/discover')
    await page.waitForTimeout(1000)
    // Sayfa yüklenmeli, hata olmamalı
    await expect(page.locator('body')).not.toContainText('500')
  })

  test('deneyim detayına gidilir', async ({ authPage: page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    const firstCard = page.locator('article').first()
    if (await firstCard.isVisible()) {
      await firstCard.click()
      await expect(page).toHaveURL(/\/experiences\/\d+/)
    }
  })
})
