import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabaseAuth = await createClient()
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser()
    const role = (user?.user_metadata as any)?.role
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
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
