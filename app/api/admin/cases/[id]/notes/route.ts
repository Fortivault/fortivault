import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { z } from "zod"

const Schema = z.object({ content: z.string().min(1), title: z.string().optional(), note_type: z.string().optional(), priority: z.string().optional() })

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()

    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

    let email: string | null = null
    if (token) {
      const { data: userRes, error: userErr } = await supabase.auth.getUser(token)
      if (userErr || !userRes?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      email = userRes.user.email ?? null
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminRow, error: adminErr } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email)
      .eq("status", "active")
      .single()
    if (adminErr || !adminRow) {
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
