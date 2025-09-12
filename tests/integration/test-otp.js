// Simple integration test for /api/send-otp
const fetch = global.fetch || require('node-fetch')
;(async function () {
  try {
    const res = await fetch(process.env.TEST_BASE_URL || 'http://localhost:10000/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'integration-test@example.com', caseId: 'TESTCASE123' }),
    })
    const body = await res.json()
    console.log('send-otp status', res.status, body)
    process.exit(res.ok ? 0 : 2)
  } catch (err) {
    console.error('send-otp test error', err)
    process.exit(3)
  }
})()
