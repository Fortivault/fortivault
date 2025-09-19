import { test, expect, request } from '@playwright/test'

test('CSRF protection blocks invalid requests', async ({ baseURL }) => {
  const res = await request.newContext().post(`${baseURL}/api/agent/reset-stats`, {
    headers: { 'Content-Type': 'application/json' },
    data: {},
  })
  expect(res.status()).toBe(403)
})
