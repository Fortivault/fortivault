"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

import type { AgentPublic } from "@/types/entities"

interface AgentAuthContextType {
  agent: AgentPublic | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AgentAuthContext = createContext<AgentAuthContextType | undefined>(undefined)

export function AgentAuthProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<AgentPublic | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/agent/me", { cache: "no-store" })
        if (!mounted) return
        if (res.ok) {
          const j = await res.json()
          setAgent(j.agent)
        } else {
          setAgent(null)
        }
      } catch {
        setAgent(null)
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/agent/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const agentData = await response.json()
        setAgent(agentData.agent)
        return true
      }
    } catch (error) {
      console.error("Agent login error:", error)
    }

    return false
  }

  const logout = async () => {
    try {
      await fetch("/api/agent/logout", { method: "POST" })
    } catch {}
    setAgent(null)
    router.push("/agent/login")
  }

  return (
    <AgentAuthContext.Provider
      value={{
        agent,
        login,
        logout,
        isLoading,
        isAuthenticated: !!agent,
      }}
    >
      {children}
    </AgentAuthContext.Provider>
  )
}

export function useAgentAuth() {
  const context = useContext(AgentAuthContext)
  if (context === undefined) {
    throw new Error("useAgentAuth must be used within an AgentAuthProvider")
  }
  return context
}
