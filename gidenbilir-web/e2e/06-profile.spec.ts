import { test, expect } from './fixtures'

test.describe('Profil', () => {
  test('profil sayfası açılır ve bilgiler görünür', async ({ authPage: page }) => {
    await page.goto('/profile/me')
    await expect(page).not.toHaveURL('/login')
    await expect(page.locator('body')).not.toContainText('500')
  })

  test('çıkış yapılır', async ({ authPage: page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Çıkış Yap' }).click()
    await expect(page).toHaveURL('/login')
  })
})
