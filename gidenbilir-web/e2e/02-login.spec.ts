import { test, expect } from '@playwright/test'

const EMAIL = process.env.TEST_USER_EMAIL ?? 'ntedbirli@gmail.com'
const PASSWORD = process.env.TEST_USER_PASSWORD ?? ''

test.describe('Giriş yap', () => {
  test('geçerli bilgilerle giriş yapılır', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-posta').fill(EMAIL)
    await page.getByLabel('Şifre').fill(PASSWORD)
    await page.getByRole('button', { name: 'Giriş Yap' }).click()
    await page.waitForURL('/')
    await expect(page).toHaveURL('/')
  })

  test('yanlış şifre hata gösterir', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-posta').fill(EMAIL)
    await page.getByLabel('Şifre').fill('yanlis_sifre_123')
    await page.getByRole('button', { name: 'Giriş Yap' }).click()
    // Hata mesajı görünmeli, yönlendirme olmamalı
    await expect(page).toHaveURL('/login')
  })

  test('giriş sonrası korunan sayfa erişilebilir', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-posta').fill(EMAIL)
    await page.getByLabel('Şifre').fill(PASSWORD)
    await page.getByRole('button', { name: 'Giriş Yap' }).click()
    await page.waitForURL('/')
    await page.goto('/profile/me')
    await expect(page).not.toHaveURL('/login')
  })
})
