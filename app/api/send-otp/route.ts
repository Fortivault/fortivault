import { NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"
import { z } from "zod"
import { rateLimiter } from "@/lib/security/rate-limiter"
import { createAdminClient } from "@/lib/supabase/admin"
import bcrypt from "bcryptjs"
import { badRequest, serverError, ok, tooManyRequests } from "@/lib/api/response"

const SendOtpSchema = z.object({ email: z.string().email(), caseId: z.string().min(3) })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = SendOtpSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest("Invalid input")
    }

    const { email, caseId } = parsed.data

    // Throttle by IP+email
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const id = `${ip}:${email}`
    const allowed = rateLimiter.isAllowed(id, { windowMs: 60_000, maxRequests: 3 })
    if (!allowed) {
      return tooManyRequests("Too many requests. Please wait a minute before retrying.")
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
      return serverError("Failed to generate OTP")
    }

    const result = await emailService.sendOTP(email, otp, caseId)

    if (result.success) {
      return ok({ message: "OTP sent successfully" })
    } else {
      console.error("[v0] sendOTP failed", result.error)
      return serverError("Failed to send OTP email")
    }
  } catch (error) {
    console.error("[v0] Send OTP API error:", error)
    return serverError("Internal server error")
  }
}
