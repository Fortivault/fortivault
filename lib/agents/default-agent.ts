import { createClient } from "@/lib/supabase/server"

export async function getDefaultAgentId() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("agents")
    .select("id, is_online, last_seen")
    .eq("status", "active")
    .order("is_online", { ascending: false })
    .order("last_seen", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle()

  return data?.id ?? null
}
