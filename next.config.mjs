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
  allowedDevOrigins: ["*.fly.dev", "upright-understanding.net", "*.upright-understanding.net"],
}

const sentryWebpackPluginOptions = {
  silent: true,
}

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions)
