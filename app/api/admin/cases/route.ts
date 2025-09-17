import { NextResponse, type NextRequest } from "next/server"
import { getAdminContext, isAuthorizedAdmin } from "@/lib/supabase/admin-auth"
import { withRateLimit, ADMIN_RATE_LIMITS } from "@/lib/security/rate-limiter"

async function handler(request: NextRequest) {
  try {
    const ctx = await getAdminContext(request)
    if (!isAuthorizedAdmin(ctx)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { data, error } = await ctx.supabase
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

export const GET = withRateLimit(ADMIN_RATE_LIMITS.API)(handler)
