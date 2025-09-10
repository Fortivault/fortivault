import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { rateLimiter } from "@/lib/security/rate-limiter"
import type { AdminUser, AdminUserPublic } from "@/types/entities"
import { z } from "zod"
import { signSession } from "@/lib/security/session"
import bcrypt from "bcryptjs"

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

    const ipKey = `ip:${ip}:admin_auth`
    const ipAllowed = rateLimiter.isAllowed(ipKey, { windowMs: 10 * 60 * 1000, maxRequests: 100 })
    if (!ipAllowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    const body = await request.json()
    const parsed = LoginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }
    const { email, password } = parsed.data

    const idKey = `ip:${ip}:email:${email}:admin_auth`
    const allowed = rateLimiter.isAllowed(idKey, { windowMs: 60 * 1000, maxRequests: 5 })
    if (!allowed) {
      return NextResponse.json({ error: "Too many login attempts. Please wait and try again." }, { status: 429 })
    }

    const supabase = createAdminClient()

    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .eq("status", "active")
      .single()

    if (error || !admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValidPassword = await bcrypt.compare(password, (admin as AdminUser).password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const { password_hash, ...adminData } = admin as AdminUser

    const token = await signSession({ sub: adminData.id, role: "admin" })
    const res = NextResponse.json({ success: true, admin: adminData as AdminUserPublic })
    res.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (error) {
    console.error("[v0] Admin auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
