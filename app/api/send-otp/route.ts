import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"
import { z } from "zod"

const SendOtpSchema = z.object({ email: z.string().email(), caseId: z.string().min(3) })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = SendOtpSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { email, caseId } = parsed.data

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    const result = await emailService.sendOTP(email, otp, caseId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "OTP sent successfully",
        otp: process.env.NODE_ENV === "development" ? otp : undefined,
      })
    } else {
      return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Send OTP API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
