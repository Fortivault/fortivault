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
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const hasAdmin = (data?.users || []).some((u) => (u.user_metadata as any)?.role === "admin")
    return NextResponse.json({ needsSetup: !hasAdmin })
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

    // Ensure no admin exists yet
    const { data, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
    if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 })
    const hasAdmin = (data?.users || []).some((u) => (u.user_metadata as any)?.role === "admin")
    if (hasAdmin) return NextResponse.json({ error: "Admin already initialized" }, { status: 409 })

    const { data: created, error } = await supabase.auth.admin.createUser({
      email: parsed.data.email.toLowerCase().trim(),
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: { role: "admin" },
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (!created.user?.id || !created.user.email) {
      return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
    }

    const password_hash = await bcrypt.hash(parsed.data.password, 10)

    const { error: upsertErr } = await supabase
      .from("admin_users")
      .upsert(
        {
          id: created.user.id,
          email: created.user.email,
          name: null,
          status: "active",
          password_hash,
        },
        { onConflict: "id" }
      )
    if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 })

    return NextResponse.json({ admin: { id: created.user.id, email: created.user.email, status: "active" } })
  } catch (err) {
    return NextResponse.json({ error: "Failed to initialize admin" }, { status: 500 })
  }
}
