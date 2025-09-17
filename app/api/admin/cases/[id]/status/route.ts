import { NextResponse, type NextRequest } from "next/server"
import { getAdminContext, isAuthorizedAdmin } from "@/lib/supabase/admin-auth"
import { withRateLimit, ADMIN_RATE_LIMITS } from "@/lib/security/rate-limiter"
import { withCSRFProtection } from "@/lib/security/csrf"
import { z } from "zod"

const Schema = z.object({ status: z.string().min(1).max(64) })

async function handler(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ctx = await getAdminContext(request)
    if (!isAuthorizedAdmin(ctx)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const { data, error } = await ctx.supabase
      .from("cases")
      .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
      .eq("id", id)
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

export const PATCH = withRateLimit(ADMIN_RATE_LIMITS.SENSITIVE)(withCSRFProtection(handler))
