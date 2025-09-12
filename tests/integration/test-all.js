const { spawnSync } = require('child_process')
const tests = ['test-otp.js', 'test-verify-otp.js', 'test-admin-login.js']
const base = process.env.TEST_BASE_URL || 'http://localhost:10000'
console.log('Running integration tests against', base)
let failed = false
for (const t of tests) {
  console.log('--- Running', t)
  const r = spawnSync('node', [t], { cwd: __dirname, env: process.env, stdio: 'inherit' })
  if (r.status !== 0) {
    console.error(t, 'failed with status', r.status)
    failed = true
    break
  }
}
process.exit(failed ? 1 : 0)
