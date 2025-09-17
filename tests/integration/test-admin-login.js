// Integration test for admin login API
const fetch = global.fetch || require('node-fetch')
;(async function () {
  try {
    const email = process.env.TEST_ADMIN_EMAIL || 'admin@example.com'
    const password = process.env.TEST_ADMIN_PASS || 'password'
    const res = await fetch(process.env.TEST_BASE_URL || 'http://localhost:10000/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    console.log('admin-login status', res.status)
    const body = await res.json().catch(() => ({}))
    console.log('admin-login body', body)
    // Inspect cookies header is not straightforward from fetch; rely on status
    process.exit(res.ok ? 0 : 2)
  } catch (err) {
    console.error('admin-login test error', err)
    process.exit(3)
  }
})()
