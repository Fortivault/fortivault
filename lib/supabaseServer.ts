import { createClient as createSbClient } from "@supabase/supabase-js"
import type { Database } from "../types/database.types"

export function createSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error("Missing Supabase service env vars")
  return createSbClient<Database>(url, serviceKey, { auth: { persistSession: false } })
}
