import { test, expect } from '@playwright/test'

test.describe('Kayıt ol', () => {
  test('yeni kullanıcı kayıt olabilir', async ({ page }) => {
    const email = `e2e_${Date.now()}@test.com`

    await page.goto('/register')
    await expect(page.getByRole('heading', { name: 'Hesap Oluştur' })).toBeVisible()

    await page.getByLabel('Ad Soyad').fill('E2E Test Kullanıcı')
    await page.getByLabel('E-posta').fill(email)
    await page.getByLabel('Şifre').fill('E2eTest123!')

    // Milliyet seç
    await page.getByPlaceholder('Milliyet ara').click()
    await page.getByPlaceholder('Milliyet ara').fill('Türk')
    await page.getByText('Türk').first().click()

    await page.getByRole('button', { name: 'Hesap Oluştur' }).click()
    await page.waitForURL('/')
    await expect(page).toHaveURL('/')
  })

  test('boş form submit edilemez', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('button', { name: 'Hesap Oluştur' }).click()
    // Hata mesajı görünmeli veya sayfa değişmemeli
    await expect(page).toHaveURL('/register')
  })
})
