import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { z } from "zod"

const Schema = z.object({ status: z.string().min(1).max(64) })

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()

    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

    let email: string | null = null
    if (token) {
      const { data: userRes, error: userErr } = await supabase.auth.getUser(token)
      if (userErr || !userRes?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      email = userRes.user.email ?? null
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminRow, error: adminErr } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email)
      .eq("status", "active")
      .single()
    if (adminErr || !adminRow) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("cases")
      .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ case: data })
  } catch (err) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}
