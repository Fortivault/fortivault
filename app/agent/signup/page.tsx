"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function AgentSignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [referral, setReferral] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)
    const res = await fetch("/api/agent/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, referral }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success("Signup successful! Awaiting admin approval.")
      setName("")
      setEmail("")
      setPassword("")
      setReferral("")
    } else {
      const msg = await res.text()
      toast.error(msg || "Signup failed")
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Agent Onboarding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <Input value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Referral Code (optional)</label>
            <Input value={referral} onChange={e => setReferral(e.target.value)} disabled={loading} />
          </div>
          <Button onClick={handleSignup} disabled={loading || !name || !email || !password}>Sign Up</Button>
        </CardContent>
      </Card>
    </div>
  )
}
