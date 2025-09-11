import { type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database.types"

export interface AdminContext {
  supabase: ReturnType<typeof createAdminClient>
  adminId: string
  email: string
}

function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization")
  if (!authHeader) return null
  if (!authHeader.startsWith("Bearer ")) return null
  return authHeader.slice(7)
}

export async function getAdminContext(request: NextRequest): Promise<AdminContext | null> {
  const supabase = createAdminClient()
  const token = getBearerToken(request)
  if (!token) return null

  const { data: userRes, error: userErr } = await supabase.auth.getUser(token)
  if (userErr || !userRes?.user || !userRes.user.id) return null

  const userId = userRes.user.id
  const email = userRes.user.email || ""

  // Cross-check active admin in admin_users by id (preferred)
  const { data: rowById } = await supabase
    .from("admin_users")
    .select("id, status")
    .eq("id", userId)
    .eq("status", "active")
    .single()

  if (!rowById) {
    // Fallback cross-check by email if ids are not synced
    const { data: rowByEmail } = await supabase
      .from("admin_users")
      .select("id, status")
      .eq("email", email)
      .eq("status", "active")
      .single()
    if (!rowByEmail) return null
  }

  return { supabase, adminId: rowById?.id || userId, email }
}

export function isAuthorizedAdmin(ctx: AdminContext | null): ctx is AdminContext {
  return !!ctx && !!ctx.adminId
}
