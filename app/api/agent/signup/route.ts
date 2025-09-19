import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { z } from "zod"
import bcrypt from "bcryptjs"

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  referral: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return new NextResponse("Invalid input", { status: 400 })
    }
    const { name, email, password, referral } = parsed.data
    const supabase = createAdminClient()
    // Check if agent exists
    const { data: existing } = await supabase
      .from("agents")
      .select("id")
      .eq("email", email)
      .single()
    if (existing) {
      return new NextResponse("Agent already exists", { status: 409 })
    }
    // Hash password
    const password_hash = await bcrypt.hash(password, 10)
    // Insert agent with status 'inactive' (pending admin approval)
    const { error } = await supabase.from("agents").insert({
      name,
      email,
      password_hash,
      status: "inactive",
      referral_code: referral || null,
    })
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Agent signup error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
