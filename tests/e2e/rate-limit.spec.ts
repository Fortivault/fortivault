import { test, expect, request } from '@playwright/test'

test('Rate limiting on agent login', async ({ baseURL }) => {
  const ctx = await request.newContext()
  for (let i = 0; i < 6; i++) {
    await ctx.post(`${baseURL}/api/agent/auth`, {
      headers: { 'Content-Type': 'application/json' },
      data: { email: 'agent@example.com', password: 'wrongpass' },
    })
  }
  const res = await ctx.post(`${baseURL}/api/agent/auth`, {
    headers: { 'Content-Type': 'application/json' },
    data: { email: 'agent@example.com', password: 'wrongpass' },
  })
  expect(res.status()).toBe(429)
})
