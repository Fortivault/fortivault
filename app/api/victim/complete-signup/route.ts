import { NextResponse } from "next/server"
import { z } from "zod"
import { verifySession, signSession } from "@/lib/security/session"
import { createAdminClient } from "@/lib/supabase/admin"
import { badRequest, serverError, ok, tooManyRequests } from "@/lib/api/response"
import { rateLimiter } from "@/lib/security/rate-limiter"

const CASE_ID_REGEX = /^CSRU-[A-Z0-9]{9}$/
const PasswordSchema = z
  .string()
  .min(8)
  .max(72)
  .regex(/[a-z]/, "lowercase")
  .regex(/[A-Z]/, "uppercase")
  .regex(/\d/, "number")
  .regex(/[^A-Za-z0-9]/, "special")

const Schema = z.object({
  token: z.string().min(10),
  caseId: z.string().regex(CASE_ID_REGEX),
  password: PasswordSchema,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token") || ""
    if (!token) return badRequest("Missing token")
    const payload = await verifySession(token)
    if (!payload || payload.type !== "victim_signup") return badRequest("Invalid or expired link")
    return ok({ valid: true, email: payload.email, caseId: payload.caseId })
  } catch (e) {
    console.error("[v0] victim complete-signup validate error:", e)
    return serverError("Internal server error")
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return badRequest("Invalid input")

    const { token, caseId, password } = parsed.data
    const payload = await verifySession(token)
    if (!payload || payload.type !== "victim_signup") {
      return badRequest("Invalid or expired link")
    }

    if (payload.caseId !== caseId) {
      return badRequest("Case ID does not match.")
    }

    const email = payload.email as string

    // Rate limit by IP+email
    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown"
    const id = `${ip}:${email}:complete-signup`
    const allowed = rateLimiter.isAllowed(id, { windowMs: 30_000, maxRequests: 5 })
    if (!allowed) {
      return tooManyRequests("Too many attempts. Please wait and try again.")
    }

    const supabase = createAdminClient()
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "user", case_id: caseId },
    })

    if (error) {
      const msg = error.message || "Account creation failed"
      if (/already\s+registered/i.test(msg)) {
        return badRequest("Email already registered. Try signing in instead.")
      }
      return badRequest(msg)
    }

    const victimToken = await signSession({ email, caseId, role: "victim" }, 60 * 60 * 24 * 7)
    const res = NextResponse.json({ success: true, email })
    res.cookies.set("victim_session", victimToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    })

    return res
  } catch (e) {
    console.error("[v0] victim complete-signup error:", e)
    return serverError("Internal server error")
  }
}
