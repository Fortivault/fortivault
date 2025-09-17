"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const CASE_ID_REGEX = /^CSRU-[A-Z0-9]{9}$/

export default function VictimCompleteSignupPage() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get("token") || ""
  const [caseId, setCaseId] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const strong = useMemo(() => {
    return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)
  }, [password])

  useEffect(() => {
    let cancelled = false
    const validate = async () => {
      if (!token) {
        setStatus("Missing or invalid link.")
        return
      }
      try {
        const res = await fetch(`/api/victim/complete-signup?token=${encodeURIComponent(token)}`)
        const data = await res.json()
        if (!cancelled) {
          if (res.ok && data.valid && data.caseId) {
            setCaseId(data.caseId)
            setStatus(null)
          } else {
            setStatus(data.error || "Missing or invalid link.")
          }
        }
      } catch (e) {
        if (!cancelled) setStatus("Missing or invalid link.")
      }
    }
    validate()
    return () => {
      cancelled = true
    }
  }, [token])

  const submit = async () => {
    if (!token || !CASE_ID_REGEX.test(caseId) || !strong || password !== confirm) return
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
        setStatus("Account created. Redirecting...")
        setTimeout(() => router.push(`/dashboard?caseId=${encodeURIComponent(caseId)}`), 1200)
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
          <Input placeholder="Case ID (e.g., CSRU-XXXXXX)" value={caseId} onChange={(e) => setCaseId(e.target.value.toUpperCase())} readOnly={!!caseId} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input type="password" placeholder="Confirm Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <p className="text-xs text-muted-foreground">Use at least 8 characters with upper, lower, number and symbol.</p>
          <Button className="w-full" onClick={submit} disabled={loading || !token || !CASE_ID_REGEX.test(caseId) || !strong || password !== confirm}>
            {loading ? "Setting up..." : "Create Password"}
          </Button>
          {status && <p className="text-sm text-center text-muted-foreground">{status}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
