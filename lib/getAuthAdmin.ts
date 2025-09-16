import type { NextApiRequest } from "next"
import { createSupabaseServiceClient } from "./supabaseServer"

export interface GetAuthAdminResult {
  user?: {
    id: string
    email: string | null
  }
  admin?: {
    id: string
    email: string | null
  }
  error?: string
}

function readAccessTokenFromCookies(req: NextApiRequest): string | null {
  // Supabase sets sb-access-token/sb-refresh-token cookies
  const token = (req.cookies["sb-access-token"] || req.cookies["sb:token"]) as string | undefined
  return token || null
}

export async function getAuthAdmin(req: NextApiRequest): Promise<GetAuthAdminResult> {
  try {
    const token = readAccessTokenFromCookies(req)
    if (!token) return { error: "Missing auth token" }

    const supabase = createSupabaseServiceClient()
    const { data: userRes, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userRes?.user) return { error: "Invalid or expired token" }

    const user = userRes.user

    // Prefer checking by id; fall back to email
    const { data: adminById } = await supabase
      .from("admin_users")
      .select("id,email,status")
      .eq("id", user.id)
      .maybeSingle()

    let adminRow = adminById

    if (!adminRow && user.email) {
      const { data: adminByEmail } = await supabase
        .from("admin_users")
        .select("id,email,status")
        .eq("email", user.email)
        .maybeSingle()
      adminRow = adminByEmail || null
    }

    if (!adminRow || (adminRow as any).status === "suspended") {
      return { error: "Admin access required" }
    }

    return {
      user: { id: user.id, email: user.email || null },
      admin: { id: (adminRow as any).id, email: (adminRow as any).email || user.email || null },
    }
  } catch (e) {
    return { error: "Authorization failure" }
  }
}
