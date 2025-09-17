import { NextRequest } from "next/server"

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  isAllowed(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Get existing requests for this identifier
    const userRequests = this.requests.get(identifier) || []

    // Filter out requests outside the current window
    const validRequests = userRequests.filter((time) => time > windowStart)

    // Check if under limit
    if (validRequests.length >= config.maxRequests) {
      return false
    }

    // Add current request
    validRequests.push(now)
    this.requests.set(identifier, validRequests)

    return true
  }

  checkLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Get existing requests for this identifier
    const userRequests = this.requests.get(identifier) || []

    // Filter out requests outside the current window
    const validRequests = userRequests.filter((time) => time > windowStart)

    const allowed = validRequests.length < config.maxRequests
    const remaining = Math.max(0, config.maxRequests - validRequests.length)
    const resetTime = validRequests.length > 0 ? validRequests[0] + config.windowMs : now + config.windowMs

    if (allowed) {
      validRequests.push(now)
      this.requests.set(identifier, validRequests)
    }

    return {
      allowed,
      remaining: allowed ? remaining - 1 : remaining,
      resetTime
    }
  }

  cleanup(): void {
    const now = Date.now()
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter((time) => time > now - 3600000) // Keep 1 hour
      if (validRequests.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, validRequests)
      }
    }
  }
}

export const rateLimiter = new RateLimiter()

// Rate limit configurations for different admin endpoints
export const ADMIN_RATE_LIMITS = {
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // 5 login attempts per 15 minutes
  },
  API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60 // 60 requests per minute
  },
  SENSITIVE: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10 // 10 requests per 5 minutes for sensitive operations
  }
}

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const ip = forwarded?.split(",")[0] || realIp || "unknown"
  
  return `ip:${ip}`
}

/**
 * Rate limiting middleware for admin routes
 */
export function withRateLimit(config: RateLimitConfig) {
  return function(handler: (request: NextRequest, ...args: any[]) => Promise<Response>) {
    return async (request: NextRequest, ...args: any[]): Promise<Response> => {
      const identifier = getClientIdentifier(request)
      const result = rateLimiter.checkLimit(identifier, config)
      
      if (!result.allowed) {
        return new Response(
          JSON.stringify({ 
            error: "Too many requests",
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
          }),
          { 
            status: 429,
            headers: { 
              "Content-Type": "application/json",
              "Retry-After": Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
              "X-RateLimit-Limit": config.maxRequests.toString(),
              "X-RateLimit-Remaining": result.remaining.toString(),
              "X-RateLimit-Reset": result.resetTime.toString()
            }
          }
        )
      }
      
      const response = await handler(request, ...args)
      
      // Add rate limit headers to successful responses
      response.headers.set("X-RateLimit-Limit", config.maxRequests.toString())
      response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
      response.headers.set("X-RateLimit-Reset", result.resetTime.toString())
      
      return response
    }
  }
}

// Cleanup old entries every 10 minutes
setInterval(() => rateLimiter.cleanup(), 600000)
