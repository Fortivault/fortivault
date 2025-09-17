import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { getAdminContext, isAuthorizedAdmin } from "@/lib/supabase/admin-auth"
import { withRateLimit, ADMIN_RATE_LIMITS } from "@/lib/security/rate-limiter"
import { withCSRFProtection } from "@/lib/security/csrf"

const BodySchema = z.object({ confirm: z.literal("RESET") })

async function handler(request: NextRequest) {
  try {
    const ctx = await getAdminContext(request)
    if (!isAuthorizedAdmin(ctx)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Confirmation required" }, { status: 400 })
    }

    // Perform deletions in dependency order
    const supabase = ctx.supabase

    const results: Record<string, number> = {}

    // messages
    {
      const { count } = await supabase.from("messages").select("id", { count: "exact", head: true })
      await supabase.from("messages").delete().neq("id", "")
      results.messages = count || 0
    }

    // chat_rooms
    {
      const { count } = await supabase.from("chat_rooms").select("id", { count: "exact", head: true })
      await supabase.from("chat_rooms").delete().neq("id", "")
      results.chat_rooms = count || 0
    }

    // case_notes
    {
      const { count } = await supabase.from("case_notes").select("id", { count: "exact", head: true })
      await supabase.from("case_notes").delete().neq("id", "")
      results.case_notes = count || 0
    }

    // case_assignments
    {
      const { count } = await supabase.from("case_assignments").select("id", { count: "exact", head: true })
      await supabase.from("case_assignments").delete().neq("id", "")
      results.case_assignments = count || 0
    }

    // case_escalations
    {
      const { count } = await supabase.from("case_escalations").select("id", { count: "exact", head: true })
      await supabase.from("case_escalations").delete().neq("id", "")
      results.case_escalations = count || 0
    }

    // email_otp
    {
      const { count } = await supabase.from("email_otp").select("id", { count: "exact", head: true })
      await supabase.from("email_otp").delete().neq("id", "")
      results.email_otp = count || 0
    }

    // Collect victim emails before deleting cases
    const { data: victimRows } = await supabase.from("cases").select("victim_email")
    const victimEmails = Array.from(new Set((victimRows || []).map((r) => r.victim_email).filter(Boolean)))

    // cases
    {
      const { count } = await supabase.from("cases").select("id", { count: "exact", head: true })
      await supabase.from("cases").delete().neq("id", "")
      results.cases = count || 0
    }

    // profiles (victims only)
    if (victimEmails.length > 0) {
      // Only delete standard users to avoid removing reviewers/admins
      await supabase.from("profiles").delete().in("email", victimEmails).eq("role", "user")
      results.victim_profiles = victimEmails.length
    } else {
      results.victim_profiles = 0
    }

    return NextResponse.json({ ok: true, results })
  } catch (err: any) {
    console.error("Reset error:", err)
    return NextResponse.json({ error: "Failed to reset database" }, { status: 500 })
  }
}

export const POST = withRateLimit(ADMIN_RATE_LIMITS.SENSITIVE)(withCSRFProtection(handler))
