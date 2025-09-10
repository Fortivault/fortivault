import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"
import { z } from "zod"

const VerifyOtpSchema = z.object({ email: z.string().email(), otp: z.string().length(6), caseId: z.string().min(3) })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = VerifyOtpSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { email, otp, caseId } = parsed.data

    const dashboardToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?token=${dashboardToken}&case=${caseId}`

    const result = await emailService.sendWelcomeEmail(email, caseId, dashboardLink)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email verified successfully",
        dashboardLink: dashboardLink,
      })
    } else {
      return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Verify OTP API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
