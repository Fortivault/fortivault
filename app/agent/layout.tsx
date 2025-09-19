import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { AgentAuthProvider } from "@/hooks/use-agent-auth"
import { verifyJWT } from "@/lib/auth/jwt"
import { createClient } from "@/lib/supabase/server"

export default async function AgentLayout({ children }: { children: ReactNode }) {
  try {
    // Initialize Supabase client
    const supabase = await createClient()

    // Get current session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/agent/login")
    }

    // Verify agent in database
    const { data: agentData } = await supabase
      .from("agents")
      .select("id, role, active, requires_2fa")
      .eq("user_id", session.user.id)
      .single()

    if (!agentData || !agentData.active) {
      redirect("/agent/login")
    }

    // Check 2FA if required
    if (agentData.requires_2fa) {
      const cookieStore = cookies()
      const twoFactorCompleted = cookieStore.get("2fa_completed")?.value
      if (!twoFactorCompleted) {
        redirect("/agent/two-factor")
      }
    }

    return (
      <AgentAuthProvider>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </AgentAuthProvider>
    )
  } catch (error) {
    console.error("Agent authentication error:", error)
    redirect("/agent/login")
  }
}
