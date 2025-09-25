"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

import type { Profile } from "@/types/entities"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  login: (email: string, password: string) => Promise<void>
  signup: (userData: any) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  useEffect(() => {
    if (!hasSupabase) {
      // Supabase not configured; skip auth wiring
      setIsLoading(false)
      return
    }

    supabaseRef.current = createClient()

    const supabase = supabaseRef.current

    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase!.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      }

      setIsLoading(false)
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [hasSupabase])

  const fetchProfile = async (userId: string) => {
    try {
      if (!supabaseRef.current) return
      const { data, error } = await supabaseRef.current
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const ensureSupabase = () => {
    if (!supabaseRef.current) {
      throw new Error("Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.")
    }
    return supabaseRef.current
  }

  const login = async (email: string, password: string) => {
    const supabase = ensureSupabase()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signup = async (userData: any) => {
    const supabase = ensureSupabase()
    const { error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role || "user",
        },
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
      },
    })

    if (error) throw error

    router.push("/auth/check-email")
  }

  const logout = async () => {
    const supabase = ensureSupabase()
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    setUser(null)
    setProfile(null)
    router.push("/")
  }

  useEffect(() => {
    if (user && profile && !isLoading) {
      const currentPath = window.location.pathname
      if (profile.role === "reviewer" && !currentPath.startsWith("/reviewer")) {
        router.push("/reviewer")
      } else if (profile.role === "user" && !currentPath.startsWith("/dashboard")) {
        router.push("/dashboard")
      }
    }
  }, [user, profile, isLoading, router])

  return (
    <AuthContext.Provider value={{ user, profile, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
