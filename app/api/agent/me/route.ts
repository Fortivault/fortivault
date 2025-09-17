import { createAdminClient } from "@/lib/supabase/admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { verifySession } from "@/lib/security/session"

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || ""
    const match = cookieHeader.split("; ").find((c) => c.startsWith("agent_session="))
    const token = match ? decodeURIComponent(match.split("=")[1]) : ""
    const payload = token ? await verifySession(token) : null

    if (!payload || !payload.sub || payload.role !== "agent") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } })
    }

    const supabase = createAdminClient()
    const { data: agent, error } = await supabase.from("agents").select("*").eq("id", payload.sub).single()

    if (error || !agent) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } })
    }

    const { password_hash, ...agentPublic } = agent as any
    return new Response(JSON.stringify({ agent: agentPublic }), { status: 200, headers: { "content-type": "application/json" } })
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { "content-type": "application/json" } })
  }
}
