import { test, expect } from '@playwright/test'

test('Rate limiting on agent login', async ({ request }) => {
  for (let i = 0; i < 6; i++) {
    await request.post('/api/agent/auth', {
      headers: { 'Content-Type': 'application/json' },
      data: { email: 'agent@example.com', password: 'wrongpass' },
    })
  }
  const res = await request.post('/api/agent/auth', {
    headers: { 'Content-Type': 'application/json' },
    data: { email: 'agent@example.com', password: 'wrongpass' },
  })
  expect(res.status()).toBe(429)
})
