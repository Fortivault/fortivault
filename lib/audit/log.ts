import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"

export interface AuditLogEntry {
  actor: string
  action: string
  resource: string
  timestamp: string
  prev_hash: string | null
  hash: string
  details?: any
}

// Compute hash for log chaining
function computeHash(entry: Omit<AuditLogEntry, "hash">): string {
  const data = `${entry.actor}|${entry.action}|${entry.resource}|${entry.timestamp}|${entry.prev_hash || ""}|${JSON.stringify(entry.details || {})}`
  return crypto.createHash("sha256").update(data).digest("hex")
}

// Append audit log entry (with hash chaining)
export async function appendAuditLog({ actor, action, resource, details }: Omit<AuditLogEntry, "timestamp" | "prev_hash" | "hash"> & { details?: any }) {
  const supabase = createAdminClient()
  // Get last log for chaining
  const { data: lastLog } = await supabase
    .from("agent_activity_logs")
    .select("hash")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()
  const prev_hash = lastLog?.hash || null
  const timestamp = new Date().toISOString()
  const entryNoHash = { actor, action, resource, timestamp, prev_hash, details }
  const hash = computeHash(entryNoHash)
  await supabase.from("agent_activity_logs").insert({
    agent_id: actor,
    activity_type: action,
    case_id: resource,
    description: details?.description || null,
    metadata: details || null,
    created_at: timestamp,
    hash,
    prev_hash,
  })
}
