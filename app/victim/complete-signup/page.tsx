"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function VictimCompleteSignupPage() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get("token") || ""
  const [caseId, setCaseId] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) setStatus("Missing or invalid link.")
  }, [token])

  const submit = async () => {
    if (!token || !caseId || !password || password !== confirm) return
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch("/api/victim/complete-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, caseId, password }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setStatus("Your account has been created. You can now sign in.")
        setTimeout(() => router.push("/login"), 2000)
      } else {
        setStatus(data.error || "Setup failed. Try again.")
      }
    } catch (e) {
      setStatus("Setup failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Signup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Enter your Case ID and create a password to finish setting up access.</p>
          <Input placeholder="Case ID (e.g., CSRU-XXXXXX)" value={caseId} onChange={(e) => setCaseId(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input type="password" placeholder="Confirm Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <Button className="w-full" onClick={submit} disabled={loading || !token || !caseId || !password || password !== confirm}>
            {loading ? "Setting up..." : "Create Password"}
          </Button>
          {status && <p className="text-sm text-center text-muted-foreground">{status}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
