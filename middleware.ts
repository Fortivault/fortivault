import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { headers } from "next/headers"
import { verifyJWT } from "@/lib/auth/jwt"

// Initialize Redis client for rate limiting (optional)
const hasUpstash = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
const redis = hasUpstash ? Redis.fromEnv() : null

// Configure rate limiters only if Upstash is configured
const loginRatelimit = hasUpstash
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(5, "5 m"), // 5 attempts per 5 minutes
      analytics: true,
      prefix: "@upstash/ratelimit/login",
    })
  : null

const apiRatelimit = hasUpstash
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
      analytics: true,
      prefix: "@upstash/ratelimit/api",
    })
  : null

// CSRF token verification
const verifyCSRFToken = async (request: NextRequest) => {
  const csrfToken = request.headers.get("x-csrf-token")
  const sessionToken = request.cookies.get("session")?.value

  if (!csrfToken || !sessionToken) {
    return false
  }

  try {
    // Verify CSRF token matches session
    const isValid = await redis.get(`csrf:${sessionToken}:${csrfToken}`)
    return !!isValid
  } catch (error) {
    console.error("CSRF verification error:", error)
    return false
  }
}

// Security headers configuration
const securityHeaders = {
  "Content-Security-Policy": 
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
}

export async function middleware(request: NextRequest) {
  // Apply security headers to all responses
  const response = NextResponse.next()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  try {
    // Update Supabase session
    const supabaseResponse = await updateSession(request)
    Object.entries(securityHeaders).forEach(([key, value]) => {
      supabaseResponse.headers.set(key, value)
    })

    const url = request.nextUrl.clone()
    const isAgentRoute = url.pathname.startsWith("/agent")
    const isAdminRoute = url.pathname.startsWith("/admin")
    const isApiRoute = url.pathname.startsWith("/api")
    const isAgentLogin = url.pathname === "/agent/login"
    const isAdminLogin = url.pathname === "/admin-login"
    
    // Rate limiting for login attempts
    if (isAgentLogin || isAdminLogin) {
      const ip = request.headers.get("x-real-ip") ??
        request.headers.get("x-forwarded-for")?.split(",")[0] ??
        "127.0.0.1"

      if (loginRatelimit) {
        const { success, limit, reset, remaining } = await loginRatelimit.limit(ip)
        if (!success) {
          return new NextResponse("Too many login attempts", {
            status: 429,
            headers: {
              "Retry-After": reset.toString(),
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          })
        }
      }
    }

    // Rate limiting for API routes
    if (isApiRoute) {
      const ip = request.headers.get("x-real-ip") ??
        request.headers.get("x-forwarded-for")?.split(",")[0] ??
        "127.0.0.1"

      if (apiRatelimit) {
        const { success, limit, reset, remaining } = await apiRatelimit.limit(ip)
        if (!success) {
          return new NextResponse("Too many requests", {
            status: 429,
            headers: {
              "Retry-After": reset.toString(),
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          })
        }
      }
    }

    // CSRF protection for state-changing methods
    if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
      const isCSRFValid = await verifyCSRFToken(request)
      if (!isCSRFValid) {
        return new NextResponse("Invalid CSRF token", { status: 403 })
      }
    }

    // Agent route protection
    if (isAgentRoute && !isAgentLogin) {
      const token = request.cookies.get("agent_session")?.value
      if (!token) {
        url.pathname = "/agent/login"
        return NextResponse.redirect(url)
      }

      try {
        const payload = await verifyJWT(token)
        if (!payload || payload.role !== "agent") {
          url.pathname = "/agent/login"
          return NextResponse.redirect(url)
        }

        // Check if 2FA is required and completed
        const twoFactorCompleted = request.cookies.get("2fa_completed")?.value
        if (!twoFactorCompleted && !isAgentLogin) {
          url.pathname = "/agent/two-factor"
          return NextResponse.redirect(url)
        }
      } catch (error) {
        console.error("Agent authentication error:", error)
        url.pathname = "/agent/login"
        return NextResponse.redirect(url)
      }
    }

    // Admin route protection with enhanced security
    if (isAdminRoute && !isAdminLogin) {
      const token = request.cookies.get("admin_session")?.value
      if (!token) {
        url.pathname = "/admin-login"
        return NextResponse.redirect(url)
      }

      try {
        const payload = await verifyJWT(token)
        if (!payload || payload.role !== "admin") {
          url.pathname = "/admin-login"
          return NextResponse.redirect(url)
        }

        // Require 2FA for admin routes
        const twoFactorCompleted = request.cookies.get("admin_2fa_completed")?.value
        if (!twoFactorCompleted && !isAdminLogin) {
          url.pathname = "/admin/two-factor"
          return NextResponse.redirect(url)
        }
      } catch (error) {
        console.error("Admin authentication error:", error)
        url.pathname = "/admin-login"
        return NextResponse.redirect(url)
      }
    }

    return supabaseResponse
  } catch (error) {
    console.error("Middleware error:", error)
    return response
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
