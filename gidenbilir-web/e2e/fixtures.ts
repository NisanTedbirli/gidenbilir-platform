import { test as base, type Page } from '@playwright/test'

const EMAIL = process.env.TEST_USER_EMAIL ?? 'ntedbirli@gmail.com'
const PASSWORD = process.env.TEST_USER_PASSWORD ?? ''

async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('E-posta').fill(EMAIL)
  await page.getByLabel('Şifre').fill(PASSWORD)
  await page.getByRole('button', { name: 'Giriş Yap' }).click()
  await page.waitForURL('/')
}

export const test = base.extend<{ authPage: Page }>({
  authPage: async ({ page }, use) => {
    await login(page)
    await use(page)
  },
})

export { expect } from '@playwright/test'
export { login }
