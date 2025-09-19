import { test, expect } from '@playwright/test'

test('CSRF protection blocks invalid requests', async ({ request }) => {
  const res = await request.post('/api/agent/reset-stats', {
    headers: { 'Content-Type': 'application/json' },
    data: {},
  })
  expect(res.status()).toBe(403)
})
