import { NextResponse } from "next/server"
import { z } from "zod"
import { verifySession, signSession } from "@/lib/security/session"
import { createAdminClient } from "@/lib/supabase/admin"
import { badRequest, serverError, ok } from "@/lib/api/response"

const Schema = z.object({ token: z.string().min(10), caseId: z.string().min(3), password: z.string().min(8) })

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

    const supabase = createAdminClient()
    const { data: userRes, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "user", case_id: caseId },
    })

    if (error) {
      return badRequest(error.message || "Account creation failed")
    }

    // Issue victim_session cookie (optional path-limited)
    const victimToken = await signSession({ email, caseId, role: "victim" }, 60 * 60 * 24 * 7)
    const res = NextResponse.json({ success: true })
    res.cookies.set("victim_session", victimToken, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 })
    return res
  } catch (e) {
    console.error("[v0] victim complete-signup error:", e)
    return serverError("Internal server error")
  }
}
