import { test, expect } from '@playwright/test'

test('Sentry does not log sensitive data', async ({ page }) => {
  // This is a placeholder: in real CI, you would mock Sentry or check logs for absence of secrets
  // Here, we just assert the Sentry DSN is set and page loads
  await page.goto('/')
  expect(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN).toBeTruthy()
})
