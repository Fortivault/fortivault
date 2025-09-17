import { NextResponse } from "next/server"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { verifySession } from "@/lib/security/session"

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || ""
    const match = cookieHeader.split("; ").find((c) => c.startsWith("agent_session="))
    const token = match ? decodeURIComponent(match.split("=")[1]) : ""
    const payload = token ? await verifySession(token) : null

    if (!payload || !payload.sub || payload.role !== "agent") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { data: agent, error } = await supabase.from("agents").select("*").eq("id", payload.sub).single()

    if (error || !agent) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { password_hash, ...agentPublic } = agent as any
    return NextResponse.json({ agent: agentPublic })
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
