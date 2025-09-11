import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { verifySession, signSession } from "@/lib/security/session"
import { createAdminClient } from "@/lib/supabase/admin"

const Schema = z.object({ token: z.string().min(10), caseId: z.string().min(3), password: z.string().min(8) })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

    const { token, caseId, password } = parsed.data
    const payload = await verifySession(token)
    if (!payload || payload.type !== "victim_signup") {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 })
    }

    if (payload.caseId !== caseId) {
      return NextResponse.json({ error: "Case ID does not match." }, { status: 400 })
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
      return NextResponse.json({ error: error.message || "Account creation failed" }, { status: 400 })
    }

    // Issue victim_session cookie (optional path-limited)
    const victimToken = await signSession({ email, caseId, role: "victim" }, 60 * 60 * 24 * 7)
    const res = NextResponse.json({ success: true })
    res.cookies.set("victim_session", victimToken, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 })
    return res
  } catch (e) {
    console.error("[v0] victim complete-signup error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
