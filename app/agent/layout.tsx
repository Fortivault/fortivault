import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { AgentAuthProvider } from "@/hooks/use-agent-auth"
import { verifySession } from "@/lib/security/session"

export default async function AgentLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("agent_session")?.value || ""
  const payload = token ? await verifySession(token) : null

  if (!payload || payload.role !== "agent" || !payload.sub) {
    redirect("/agent/login")
  }

  return <AgentAuthProvider>{children}</AgentAuthProvider>
}
