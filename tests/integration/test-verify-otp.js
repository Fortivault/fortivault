// Integration test for /api/verify-otp - expects an OTP to exist for the test email/case
const fetch = global.fetch || require('node-fetch')
;(async function () {
  try {
    // This test assumes a developer will inspect and replace OTP value or the DB is seeded for tests.
    const sampleOtp = process.env.TEST_OTP || '123456'
    const res = await fetch(process.env.TEST_BASE_URL || 'http://localhost:10000/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'integration-test@example.com', otp: sampleOtp, caseId: 'TESTCASE123' }),
    })
    const body = await res.json()
    console.log('verify-otp status', res.status, body)
    process.exit(res.ok ? 0 : 2)
  } catch (err) {
    console.error('verify-otp test error', err)
    process.exit(3)
  }
})()
