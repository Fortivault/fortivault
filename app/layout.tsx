import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProviderWrapper } from "@/components/auth/auth-provider"
import { Suspense } from "react"
import "./globals.css"
import { RouteTransitionOverlay } from "@/components/ui/route-transition-overlay"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://fortivault.example.com"),
  title: {
    default: "Fortivault — Built to protect. Trusted to Secure",
    template: "%s — Fortivault",
  },
  description:
    "Built to protect. Trusted to Secure. Professional fraud recovery and scam reporting platform. We support victims of crypto and fiat fraud with secure reporting and recovery guidance.",
  keywords: [
    "fraud recovery",
    "scam reporting",
    "crypto scam recovery",
    "financial security",
    "Fortivault",
  ],
  authors: [{ name: "Fortivault Security" }],
  creator: "Fortivault Security",
  publisher: "Fortivault Security",
  openGraph: {
    type: "website",
    siteName: "Fortivault",
    title: "Fortivault — Built to protect. Trusted to Secure",
    description:
      "Professional fraud recovery and scam reporting platform helping victims reclaim funds and protect their future.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://fortivault.example.com",
    images: [
      {
        url: "/placeholder-logo.svg",
        width: 512,
        height: 512,
        alt: "Fortivault Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@fortivault",
    creator: "@fortivault",
    title: "Fortivault — Built to protect. Trusted to Secure",
    description:
      "Professional fraud recovery and scam reporting platform helping victims reclaim funds and protect their future.",
    images: ["/placeholder-logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
    languages: { "en-US": "/" },
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <AuthProviderWrapper>{children}</AuthProviderWrapper>
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
