import { withSentryConfig } from "@sentry/nextjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["*.fly.dev"],
}

const sentryWebpackPluginOptions = {
  silent: true,
}

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions)
