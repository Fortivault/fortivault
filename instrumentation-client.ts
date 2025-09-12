import * as Sentry from '@sentry/nextjs'

export function register() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  })
  return Sentry
}

// Export required router transition hook for Next.js instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
