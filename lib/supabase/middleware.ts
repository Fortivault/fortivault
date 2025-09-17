import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Supabase environment variables not found, skipping auth check")
    return supabaseResponse
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getUser() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow access to public routes and auth routes
  const publicRoutes = [
    "/",
    "/about",
    "/contact",
    "/faq",
    "/services",
    "/how-it-works",
    "/report",
    "/privacy",
    "/terms",
    "/success-stories",
    "/team",
    "/blog",
    "/partnerships",
    "/compliance",
    "/disclaimers",
    "/fraud-types",
    "/prevention-guide",
    "/support",
    "/emergency",
    "/locations",
    "/cookies",
    "/login",
    "/signup",
    "/victim/complete-signup",
    "/admin/login",
    "/agent/login",
  ]
  const isPublicRoute =
    publicRoutes.some((route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith("/auth")) ||
    request.nextUrl.pathname === "/auth/check-email"

  const isAgentRoute = request.nextUrl.pathname.startsWith("/agent")
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")

  if (isAgentRoute) {
    const token = request.cookies.get("agent_session")?.value
    const { verifySession } = await import("@/lib/security/session")
    const payload = token ? await verifySession(token) : null
    const isLogin = request.nextUrl.pathname === "/agent/login"
    if (!payload && !isLogin) {
      const url = request.nextUrl.clone()
      url.pathname = "/agent/login"
      return NextResponse.redirect(url)
    }
  }

  if (isAdminRoute) {
    const isLogin = request.nextUrl.pathname === "/admin/login"
    
    if (!isLogin) {
      // Check if user exists and has admin role
      const role = (user?.user_metadata as any)?.role
      if (!user || role !== "admin") {
        const url = request.nextUrl.clone()
        url.pathname = "/admin/login"
        return NextResponse.redirect(url)
      }

      // Additional security: Verify admin status in database
      try {
        const { data: adminUser } = await supabase
          .from("admin_users")
          .select("id, status")
          .eq("id", user.id)
          .eq("status", "active")
          .single()

        if (!adminUser) {
          // Fallback check by email
          const { data: adminByEmail } = await supabase
            .from("admin_users")
            .select("id, status")
            .eq("email", user.email)
            .eq("status", "active")
            .single()
          
          if (!adminByEmail) {
            const url = request.nextUrl.clone()
            url.pathname = "/admin/login"
            return NextResponse.redirect(url)
          }
        }
      } catch (error) {
        console.error("Admin verification error:", error)
        const url = request.nextUrl.clone()
        url.pathname = "/admin/login"
        return NextResponse.redirect(url)
      }
    }
  }

  if (!user && !isPublicRoute) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse
}
