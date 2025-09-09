"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AgentProtectedRouteProps {
  children: React.ReactNode
}

export function AgentProtectedRoute({ children }: AgentProtectedRouteProps) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    try {
      const auth = typeof window !== "undefined" ? localStorage.getItem("agentAuth") : null
      const ok = auth === "true"
      setIsAuthed(ok)
      setChecked(true)
      if (!ok) {
        router.push("/agent/login")
      }
    } catch {
      setChecked(true)
      router.push("/agent/login")
    }
  }, [router])

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthed) return null

  return <>{children}</>
}
