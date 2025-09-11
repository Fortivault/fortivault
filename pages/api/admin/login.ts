import type { NextApiRequest, NextApiResponse } from "next"
import { createClient as createSbClient } from "@supabase/supabase-js"
import { createSupabaseServiceClient } from "@/lib/supabaseServer"

function setCookie(name: string, value: string, maxAgeSeconds: number): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
    `Max-Age=${maxAgeSeconds}`,
  ]
  return parts.join("; ")
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: "Email and password required" })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return res.status(500).json({ error: "Supabase not configured" })

  const supabase = createSbClient(url, anonKey, { auth: { persistSession: false } })

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data?.session) return res.status(401).json({ error: "Invalid credentials" })

  const { access_token, refresh_token, expires_in, user } = data.session

  // Verify admin access via service role client
  const adminClient = createSupabaseServiceClient()
  const { data: adminRow } = await adminClient
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (!adminRow) {
    return res.status(403).json({ error: "Admin access required" })
  }

  await adminClient.from("admin_users").update({ last_login: new Date().toISOString() }).eq("id", user.id)

  // Set secure HttpOnly cookies
  const cookies: string[] = []
  cookies.push(setCookie("sb-access-token", access_token, expires_in || 3600))
  if (refresh_token) cookies.push(setCookie("sb-refresh-token", refresh_token, 60 * 60 * 24 * 30))

  res.setHeader("Set-Cookie", cookies)
  return res.status(200).json({ success: true })
}
