import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { z } from "zod"
import bcrypt from "bcryptjs"

const SetupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { count, error } = await supabase
      .from("admin_users")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const needsSetup = (count ?? 0) === 0
    return NextResponse.json({ needsSetup })
  } catch (err) {
    return NextResponse.json({ error: "Failed to check setup status" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = SetupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Ensure no active admin exists yet
    const { count, error: countErr } = await supabase
      .from("admin_users")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")

    if (countErr) return NextResponse.json({ error: countErr.message }, { status: 500 })

    if ((count ?? 0) > 0) {
      return NextResponse.json({ error: "Admin already initialized" }, { status: 409 })
    }

    const password_hash = await bcrypt.hash(parsed.data.password, 10)

    const { data, error } = await supabase
      .from("admin_users")
      .insert({
        email: parsed.data.email.toLowerCase(),
        name: null,
        status: "active",
        password_hash,
      })
      .select("id, email, name, status")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ admin: data })
  } catch (err) {
    return NextResponse.json({ error: "Failed to initialize admin" }, { status: 500 })
  }
}
