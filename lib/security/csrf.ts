import { randomBytes, createHash } from "crypto"
import { cookies } from "next/headers"
import { NextRequest } from "next/server"

const CSRF_TOKEN_LENGTH = 32
const CSRF_COOKIE_NAME = "csrf-token"
const CSRF_HEADER_NAME = "x-csrf-token"

/**
 * Generate a secure CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString("hex")
}

/**
 * Legacy validation function for backward compatibility
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 64
}

/**
 * Create a hash of the CSRF token for secure storage
 */
export function hashCSRFToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

/**
 * Set CSRF token in cookies (server-side)
 */
export async function setCSRFToken(): Promise<string> {
  const token = generateCSRFToken()
  const hashedToken = hashCSRFToken(token)
  
  const cookieStore = await cookies()
  cookieStore.set(CSRF_COOKIE_NAME, hashedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  })
  
  return token
}

/**
 * Verify CSRF token from request headers
 */
export async function verifyCSRFToken(request: NextRequest): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const storedHashedToken = cookieStore.get(CSRF_COOKIE_NAME)?.value
    const submittedToken = request.headers.get(CSRF_HEADER_NAME)
    
    if (!storedHashedToken || !submittedToken) {
      return false
    }
    
    const submittedHashedToken = hashCSRFToken(submittedToken)
    return storedHashedToken === submittedHashedToken
  } catch (error) {
    console.error("CSRF verification error:", error)
    return false
  }
}

/**
 * CSRF protection middleware for API routes
 */
export function withCSRFProtection(handler: (request: NextRequest, ...args: any[]) => Promise<Response>) {
  return async (request: NextRequest, ...args: any[]): Promise<Response> => {
    // Only check CSRF for state-changing methods
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      const isValid = await verifyCSRFToken(request)
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: "Invalid CSRF token" }),
          { 
            status: 403,
            headers: { "Content-Type": "application/json" }
          }
        )
      }
    }
    
    return handler(request, ...args)
  }
}
