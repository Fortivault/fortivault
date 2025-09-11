import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { verifySession } from "@/lib/security/session"
import { z } from "zod"

const Schema = z.object({ content: z.string().min(1), title: z.string().optional(), note_type: z.string().optional(), priority: z.string().optional() })

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("admin_session")?.value
    const payload = token ? await verifySession(token) : null
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: caseRow, error: caseErr } = await supabase.from("cases").select("id, assigned_agent_id").eq("id", params.id).single()
    if (caseErr || !caseRow) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    if (!caseRow.assigned_agent_id) {
      return NextResponse.json({ error: "Case has no assigned agent for note attribution" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("case_notes")
      .insert({
        case_id: caseRow.id,
        agent_id: caseRow.assigned_agent_id,
        note_type: parsed.data.note_type || "internal",
        title: parsed.data.title || null,
        content: parsed.data.content,
        is_confidential: true,
        priority: parsed.data.priority || "normal",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ note: data })
  } catch (err) {
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 })
  }
}
