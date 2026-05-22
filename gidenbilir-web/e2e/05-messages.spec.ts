import { test, expect } from './fixtures'

test.describe('Mesajlar', () => {
  test('mesajlar sayfası açılır', async ({ authPage: page }) => {
    await page.goto('/messages')
    await expect(page).toHaveURL('/messages')
    await expect(page.locator('body')).not.toContainText('500')
  })

  test('konuşma varsa açılabilir', async ({ authPage: page }) => {
    await page.goto('/messages')
    await page.waitForTimeout(1500)
    const conversation = page.locator('a[href*="/messages/"]').first()
    if (await conversation.isVisible()) {
      await conversation.click()
      await expect(page).toHaveURL(/\/messages\/\d+/)
      // Mesaj giriş alanı görünmeli
      await expect(page.getByPlaceholder(/mesaj/i)).toBeVisible()
    }
  })
})
