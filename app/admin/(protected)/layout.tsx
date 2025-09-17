import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { ReactNode } from "react"

interface AdminLayoutProps {
  children: ReactNode
}

async function verifyAdminAccess() {
  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables")
    return false
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options)
        })
      },
    },
  })

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return false

    const userRole = user.user_metadata?.role
    if (userRole !== "admin") return false

    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("id, status, email")
      .eq("id", user.id)
      .eq("status", "active")
      .single()

    if (adminError || !adminUser) {
      const { data: adminByEmail, error: emailError } = await supabase
        .from("admin_users")
        .select("id, status, email")
        .eq("email", user.email)
        .eq("status", "active")
        .single()
      if (emailError || !adminByEmail) return false
    }

    return true
  } catch (error) {
    console.error("Error verifying admin access:", error)
    return false
  }
}

export default async function AdminProtectedLayout({ children }: AdminLayoutProps) {
  const isAuthorized = await verifyAdminAccess()
  if (!isAuthorized) {
    redirect("/admin/login")
  }
  return (
    <div className="admin-layout">
      <div className="admin-security-wrapper">{children}</div>
    </div>
  )
}
