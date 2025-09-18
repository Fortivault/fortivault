"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Shield } from "lucide-react"

interface AgentProtectedRouteProps {
  children: React.ReactNode
}

export function AgentProtectedRoute({ children }: AgentProtectedRouteProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const verifyAgentAccess = async () => {
      try {
        const response = await fetch("/api/agent/me", {
          cache: "no-store",
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.agent && data.agent.id) {
            setIsAuthenticated(true)
            return
          }
        }

        setAuthError("Agent session not found")
        setIsAuthenticated(false)
        setTimeout(() => router.push("/agent/login"), 2000)
      } catch (error) {
        console.error("Agent verification error:", error)
        setAuthError("Authentication failed")
        setIsAuthenticated(false)
        setTimeout(() => router.push("/agent/login"), 2000)
      }
    }

    verifyAgentAccess()
  }, [router])

  // Show loading state during authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <Shield className="w-12 h-12 text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Verifying Agent Access</h2>
            <p className="text-muted-foreground">Please wait while we authenticate your credentials...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state if authentication failed
  if (!isAuthenticated || authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold text-destructive">Access Denied</h2>
            <p className="text-muted-foreground">
              {authError || "You don't have permission to access this page."}
            </p>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
            <Button onClick={() => router.push("/agent/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
