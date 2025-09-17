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
    // Get the current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.log("No authenticated user found")
      return false
    }

    // Check if user has admin role in metadata
    const userRole = user.user_metadata?.role
    if (userRole !== "admin") {
      console.log("User does not have admin role")
      return false
    }

    // Additional verification: Check admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("id, status, email")
      .eq("id", user.id)
      .eq("status", "active")
      .single()

    if (adminError || !adminUser) {
      // Fallback: check by email if ID doesn't match
      const { data: adminByEmail, error: emailError } = await supabase
        .from("admin_users")
        .select("id, status, email")
        .eq("email", user.email)
        .eq("status", "active")
        .single()
      
      if (emailError || !adminByEmail) {
        console.log("User not found in admin_users table or not active")
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error verifying admin access:", error)
    return false
  }
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const isAuthorized = await verifyAdminAccess()
  
  if (!isAuthorized) {
    redirect("/admin/login")
  }

  return (
    <div className="admin-layout">
      <div className="admin-security-wrapper">
        {children}
      </div>
    </div>
  )
}