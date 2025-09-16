import * as Sentry from '@sentry/nextjs'

export function register() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  })
  return Sentry
}

// Optional export for Next.js router transition tracking; safely no-op if unsupported in current SDK
// @ts-expect-error - captureRouterTransitionStart may not exist in some @sentry/nextjs versions
export const onRouterTransitionStart = (Sentry as any).captureRouterTransitionStart?.bind(Sentry) ?? (() => {});
