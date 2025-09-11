import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
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
    const { data, error } = await supabase
      .from("cases")
      .select("id, case_id, victim_email, scam_type, amount, currency, status, priority, description, created_at, updated_at, assigned_agent_id")
      .order("updated_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ cases: data })
  } catch (err) {
    return NextResponse.json({ error: "Failed to load cases" }, { status: 500 })
  }
}
