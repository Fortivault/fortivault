import { NextResponse } from "next/server"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { rateLimiter } from "@/lib/security/rate-limiter"
import type { Agent, AgentPublic } from "@/types/entities"
import { z } from "zod"
import { signSession } from "@/lib/security/session"
import bcrypt from "bcryptjs"
import { badRequest, unauthorized, tooManyRequests, serverError, ok } from "@/lib/api/response"

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

    const ipKey = `ip:${ip}:agent_auth`
    const ipAllowed = rateLimiter.isAllowed(ipKey, { windowMs: 10 * 60 * 1000, maxRequests: 100 })
    if (!ipAllowed) {
      return tooManyRequests("Too many requests. Please try again later.")
    }

    const body = await request.json()
    const parsed = LoginSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest("Invalid input")
    }
    const { email, password } = parsed.data

    const idKey = `ip:${ip}:email:${email}:agent_auth`
    const allowed = rateLimiter.isAllowed(idKey, { windowMs: 60 * 1000, maxRequests: 5 })
    if (!allowed) {
      return tooManyRequests("Too many login attempts. Please wait and try again.")
    }

    const supabase = createAdminClient()

    const { data: agent, error } = await supabase
      .from("agents")
      .select("*")
      .eq("email", email)
      .eq("status", "active")
      .single()

    if (error || !agent) {
      return unauthorized("Invalid credentials")
    }

    const isValidPassword = await bcrypt.compare(password, (agent as Agent).password_hash)
    if (!isValidPassword) {
      return unauthorized("Invalid credentials")
    }

    const { password_hash, ...agentData } = agent as Agent

    const token = await signSession({ sub: agentData.id, role: "agent" })
    const res = NextResponse.json({ success: true, agent: agentData as AgentPublic })
    const isProd = process.env.NODE_ENV === "production"
    res.cookies.set("agent_session", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (error) {
    console.error("[v0] Agent auth error:", error)
    return serverError("Authentication failed")
  }
}
