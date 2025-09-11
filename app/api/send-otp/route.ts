import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"
import { z } from "zod"
import { rateLimiter } from "@/lib/security/rate-limiter"
import { createAdminClient } from "@/lib/supabase/admin"
import bcrypt from "bcryptjs"

const SendOtpSchema = z.object({ email: z.string().email(), caseId: z.string().min(3) })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = SendOtpSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { email, caseId } = parsed.data

    // Throttle by IP+email
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const id = `${ip}:${email}`
    const allowed = rateLimiter.isAllowed(id, { windowMs: 60_000, maxRequests: 3 })
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please wait a minute before retrying." }, { status: 429 })
    }

    // Generate & store hashed OTP (10 min)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const code_hash = await bcrypt.hash(otp, 10)
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const supabase = createAdminClient()
    const { error: upsertErr } = await supabase
      .from("email_otp")
      .upsert({ email, case_id: caseId, code_hash, expires_at, attempts: 0, consumed_at: null }, { onConflict: "email,case_id" })

    if (upsertErr) {
      console.error("[v0] OTP upsert error:", upsertErr)
      return NextResponse.json({ error: "Failed to generate OTP" }, { status: 500 })
    }

    const result = await emailService.sendOTP(email, otp, caseId)

    if (result.success) {
      return NextResponse.json({ success: true, message: "OTP sent successfully" })
    } else {
      return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Send OTP API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
