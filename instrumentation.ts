import { register as serverRegister } from "./instrumentation-server"

// Next.js expects an instrumentation.ts at the project root.
// Delegate to our server instrumentation which calls Sentry.init.
export function register() {
  return serverRegister()
}
