import { test, expect } from '@playwright/test'

test('Agent 2FA enforcement', async ({ page }) => {
  await page.goto('/agent/login')
  await page.fill('input[type="email"]', 'agent2fa@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button:has-text("Login")')
  await expect(page).toHaveURL(/agent\/two-factor/)
  await expect(page.locator('text=Two-Factor Authentication')).toBeVisible()
})
