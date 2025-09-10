"use client"

import { AgentAuthProvider } from "@/hooks/use-agent-auth"

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AgentAuthProvider>
      {children}
    </AgentAuthProvider>
  )
}
