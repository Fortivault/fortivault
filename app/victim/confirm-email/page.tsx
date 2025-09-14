"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function VictimConfirmEmailPage() {
  const params = useSearchParams()
  const router = useRouter()
  const email = params.get("email") || ""
  const caseId = params.get("caseId") || ""
  const [otp, setOtp] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!email || !caseId || otp.length !== 6) return
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch("/api/victim/confirm-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, caseId }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setStatus("Email confirmed. Redirecting to dashboard...")
        setTimeout(() => router.push(`/dashboard?caseId=${encodeURIComponent(caseId)}`), 1200)
      } else {
        setStatus(data.error || "Confirmation failed. Try again.")
      }
    } catch (e) {
      setStatus("Confirmation failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Confirm Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Enter the 6-digit code we emailed to <strong>{email}</strong> to verify your account and access your dashboard.</p>
          <Input placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} />
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={submit} disabled={loading || otp.length !== 6}>{loading ? "Verifying..." : "Verify"}</Button>
            <Button variant="outline" disabled={loading} onClick={async () => {
              try {
                setLoading(true)
                await fetch('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, caseId }) })
                setStatus('OTP resent')
              } catch (e) {
                setStatus('Failed to resend OTP')
              } finally { setLoading(false) }
            }}>Resend</Button>
          </div>

          {status && <p className="text-sm text-center text-muted-foreground">{status}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
