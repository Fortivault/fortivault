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

    // Send a confirmation OTP to the user so they can verify their email and access the dashboard
    try {
      // Generate OTP and store hashed
      const bcrypt = (await import('bcryptjs')).default
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      const code_hash = await bcrypt.hash(otp, 10)
      const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()

      const { error: upsertErr } = await supabase
        .from('email_otp')
        .upsert({ email, case_id: caseId, code_hash, expires_at, attempts: 0, consumed_at: null }, { onConflict: 'email,case_id' })

      if (upsertErr) console.error('[v0] OTP upsert error after signup:', upsertErr)

      // Send OTP email using emailService
      const { emailService } = await import('@/lib/email-service')
      await emailService.sendOTP(email, otp, caseId)
    } catch (e) {
      console.error('[v0] Failed to send post-signup OTP:', e)
    }

    return res
  } catch (e) {
    console.error("[v0] victim complete-signup error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
