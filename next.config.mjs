import { withSentryConfig } from "@sentry/nextjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["*.fly.dev", "upright-understanding.net", "*.upright-understanding.net", "*.prod-runtime.all-hands.dev"],
}

const sentryWebpackPluginOptions = {
  silent: true,
}

const useSentry = Boolean(process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT)
export default useSentry ? withSentryConfig(nextConfig, sentryWebpackPluginOptions) : nextConfig
