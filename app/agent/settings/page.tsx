"use client"

import { useState } from "react"
import { useAgentAuth } from "@/hooks/use-agent-auth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function AgentSettingsPage() {
  const { agent } = useAgentAuth()
  const [name, setName] = useState(agent?.name || "")
  const [email, setEmail] = useState(agent?.email || "")
  const [newEmail, setNewEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [step, setStep] = useState<"main"|"verify-email">("main")
  const [loading, setLoading] = useState(false)

  const handleNameChange = async () => {
    setLoading(true)
    const res = await fetch("/api/agent/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    setLoading(false)
    if (res.ok) toast.success("Name updated")
    else toast.error("Failed to update name")
  }

  const handleEmailChange = async () => {
    setLoading(true)
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail, agent: true }),
    })
    setLoading(false)
    if (res.ok) {
      setStep("verify-email")
      toast.success("OTP sent to new email")
    } else {
      toast.error("Failed to send OTP")
    }
  }

  const handleVerifyEmail = async () => {
    setLoading(true)
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail, otp, agent: true }),
    })
    setLoading(false)
    if (res.ok) {
      // Actually update email
      const updateRes = await fetch("/api/agent/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      })
      if (updateRes.ok) {
        toast.success("Email updated")
        setEmail(newEmail)
        setStep("main")
      } else {
        toast.error("Failed to update email")
      }
    } else {
      toast.error("Invalid OTP")
    }
  }

  const handlePasswordReset = async () => {
    setLoading(true)
    const res = await fetch("/api/agent/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, newPassword }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success("Password updated")
      setPassword("")
      setNewPassword("")
    } else {
      toast.error("Failed to update password")
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Agent Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <div className="flex gap-2">
              <Input value={name} onChange={e => setName(e.target.value)} disabled={loading} />
              <Button onClick={handleNameChange} disabled={loading || !name}>Update</Button>
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <div className="flex gap-2">
              <Input value={email} disabled />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Change Email</label>
            {step === "main" ? (
              <div className="flex gap-2">
                <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="New email" disabled={loading} />
                <Button onClick={handleEmailChange} disabled={loading || !newEmail}>Send OTP</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" disabled={loading} />
                <Button onClick={handleVerifyEmail} disabled={loading || !otp}>Verify & Update</Button>
                <Button variant="outline" onClick={() => setStep("main")} disabled={loading}>Cancel</Button>
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">Change Password</label>
            <div className="flex gap-2">
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Current password" disabled={loading} />
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" disabled={loading} />
              <Button onClick={handlePasswordReset} disabled={loading || !password || !newPassword}>Update</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
