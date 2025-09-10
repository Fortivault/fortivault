import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimiter } from "@/lib/security/rate-limiter"
import type { Agent, AgentPublic } from "@/types/entities"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

    // Global per-IP rate limit to protect endpoint
    const ipKey = `ip:${ip}:agent_auth`
    const ipAllowed = rateLimiter.isAllowed(ipKey, { windowMs: 10 * 60 * 1000, maxRequests: 100 })
    if (!ipAllowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    // Tighter rate limit per IP+email to prevent brute-force attacks
    const idKey = `ip:${ip}:email:${email}:agent_auth`
    const allowed = rateLimiter.isAllowed(idKey, { windowMs: 60 * 1000, maxRequests: 5 })
    if (!allowed) {
      return NextResponse.json({ error: "Too many login attempts. Please wait and try again." }, { status: 429 })
    }

    const supabase = await createClient()

    const { data: agent, error } = await supabase
      .from("agents")
      .select("*")
      .eq("email", email)
      .eq("status", "active")
      .single()

    if (error || !agent) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password (assuming passwords are hashed in database)
    const isValidPassword = await bcrypt.compare(password, (agent as Agent).password_hash)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Return agent data without password
    const { password_hash, ...agentData } = agent as Agent

    return NextResponse.json({
      success: true,
      agent: agentData as AgentPublic,
    })
  } catch (error) {
    console.error("[v0] Agent auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
