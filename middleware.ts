import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

// Enhanced middleware with admin route protection
export async function middleware(request: NextRequest) {
  try {
    // Apply Supabase session management and admin protection
    return await updateSession(request)
  } catch (error) {
    // If there's an error with Supabase middleware (e.g., Edge Runtime compatibility),
    // fall back to basic route protection
    console.warn("Supabase middleware error:", error)
    
    // Basic route protection fallback
    const isAgentRoute = request.nextUrl.pathname.startsWith("/agent")
    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")
    const isAgentLogin = request.nextUrl.pathname === "/agent/login"
    const isAdminLogin = request.nextUrl.pathname === "/admin-login"
    
    if (isAgentRoute && !isAgentLogin) {
      const token = request.cookies.get("agent_session")?.value
      if (!token) {
        const url = request.nextUrl.clone()
        url.pathname = "/agent/login"
        return NextResponse.redirect(url)
      }
    }
    
    if (isAdminRoute && !isAdminLogin) {
      // For admin routes, redirect to login if no session
      const url = request.nextUrl.clone()
      url.pathname = "/admin-login"
      return NextResponse.redirect(url)
    }
    
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
