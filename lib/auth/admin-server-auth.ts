import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export interface AdminUser {
  id: string
  email: string
  role: string
  status: string
}

/**
 * Server-side admin authentication helper
 * Verifies admin access and returns user data or redirects to login
 */
export async function requireAdminAuth(): Promise<AdminUser> {
  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables")
    redirect("/admin/login")
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
      redirect("/admin/login")
    }

    // Check if user has admin role in metadata
    const userRole = user.user_metadata?.role
    if (userRole !== "admin") {
      redirect("/admin/login")
    }

    // Verify admin status in database
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
        redirect("/admin/login")
      }
      
      return {
        id: adminByEmail.id,
        email: adminByEmail.email,
        role: userRole,
        status: adminByEmail.status
      }
    }

    return {
      id: adminUser.id,
      email: adminUser.email,
      role: userRole,
      status: adminUser.status
    }
  } catch (error) {
    console.error("Error in requireAdminAuth:", error)
    redirect("/admin/login")
  }
}

/**
 * Check admin authentication without redirecting
 * Returns null if not authenticated
 */
export async function checkAdminAuth(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
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
    
    if (userError || !user) {
      return null
    }

    const userRole = user.user_metadata?.role
    if (userRole !== "admin") {
      return null
    }

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
      
      if (emailError || !adminByEmail) {
        return null
      }
      
      return {
        id: adminByEmail.id,
        email: adminByEmail.email,
        role: userRole,
        status: adminByEmail.status
      }
    }

    return {
      id: adminUser.id,
      email: adminUser.email,
      role: userRole,
      status: adminUser.status
    }
  } catch (error) {
    console.error("Error in checkAdminAuth:", error)
    return null
  }
}