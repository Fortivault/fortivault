import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"
import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"
import bcrypt from "bcryptjs"
import { rateLimiter } from "@/lib/security/rate-limiter"
import { signSession } from "@/lib/security/session"

const VerifyOtpSchema = z.object({ email: z.string().email(), otp: z.string().length(6), caseId: z.string().min(3) })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = VerifyOtpSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { email, otp, caseId } = parsed.data

    // Throttle by IP+email
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const id = `${ip}:${email}:verify`
    const allowed = rateLimiter.isAllowed(id, { windowMs: 30_000, maxRequests: 5 })
    if (!allowed) {
      return NextResponse.json({ error: "Too many attempts. Please wait and try again." }, { status: 429 })
    }

    const supabase = createAdminClient()
    const { data: rec, error } = await supabase
      .from("email_otp")
      .select("id, code_hash, expires_at, attempts, consumed_at")
      .eq("email", email)
      .eq("case_id", caseId)
      .maybeSingle()

    if (error || !rec) {
      return NextResponse.json({ error: "Verification code not found. Request a new one." }, { status: 400 })
    }

    if (rec.consumed_at) {
      return NextResponse.json({ error: "Code already used. Request a new one." }, { status: 400 })
    }

    if (new Date(rec.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 })
    }

    const ok = await bcrypt.compare(otp, rec.code_hash)
    if (!ok) {
      const { error: updErr } = await supabase
        .from("email_otp")
        .update({ attempts: (rec.attempts || 0) + 1 })
        .eq("id", rec.id)
      if (updErr) console.error("[v0] OTP attempts update error:", updErr)
      return NextResponse.json({ error: "Invalid code. Please try again." }, { status: 400 })
    }

    // Mark consumed
    const { error: consumeErr } = await supabase
      .from("email_otp")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", rec.id)
    if (consumeErr) console.error("[v0] OTP consume error:", consumeErr)

    // Generate signed token for victim signup completion
    const token = await signSession({ email, caseId, type: "victim_signup" }, 60 * 60 * 24)
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/victim/complete-signup?token=${encodeURIComponent(token)}`

    const result = await emailService.sendWelcomeEmail(email, caseId, link)

    if (result.success) {
      return NextResponse.json({ success: true, message: "Email verified successfully" })
    } else {
      return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Verify OTP API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
