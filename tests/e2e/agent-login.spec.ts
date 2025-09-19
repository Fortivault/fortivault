import { test, expect } from '@playwright/test'

test.describe('Agent Login Flow', () => {
  test('should login and logout successfully', async ({ page }) => {
    await page.goto('/agent/login')
    await page.fill('input[type="email"]', 'agent@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button:has-text("Login")')
    await expect(page).toHaveURL(/agent/)
    await expect(page.locator('text=Agent Portal')).toBeVisible()
    // Logout
    await page.click('button:has-text("Log Out")')
    await expect(page).toHaveURL(/agent\/login/)
  })
})
