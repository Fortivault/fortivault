import { NextResponse, type NextRequest } from "next/server"
import { getAdminContext, isAuthorizedAdmin } from "@/lib/supabase/admin-auth"
import { withRateLimit, ADMIN_RATE_LIMITS } from "@/lib/security/rate-limiter"

async function handler(request: NextRequest) {
  try {
    const ctx = await getAdminContext(request)
    if (!isAuthorizedAdmin(ctx)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const pageParam = parseInt(url.searchParams.get("page") || "1", 10)
    const sizeParam = parseInt(url.searchParams.get("pageSize") || "10", 10)
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
    const pageSize = Number.isFinite(sizeParam) && sizeParam > 0 && sizeParam <= 100 ? sizeParam : 10
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await ctx.supabase
      .from("cases")
      .select(
        "id, case_id, victim_email, scam_type, amount, currency, status, priority, description, created_at, updated_at, assigned_agent_id",
        { count: "exact" }
      )
      .order("updated_at", { ascending: false })
      .range(from, to)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ cases: data || [], page, total: typeof count === "number" ? count : (data?.length || 0) })
  } catch (err) {
    return NextResponse.json({ error: "Failed to load cases" }, { status: 500 })
  }
}

export const GET = withRateLimit(ADMIN_RATE_LIMITS.API)(handler)
