import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Inserts } from "@/types/database.types"
import type { Case } from "@/types/entities"
import { z } from "zod"
import { getDefaultAgentId } from "@/lib/agents/default-agent"

const SubmitCaseSchema = z.object({
  caseId: z.string().min(3),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional().nullable(),
  scamType: z.string().min(2),
  amount: z.string().optional().nullable(),
  currency: z.string().optional().nullable(),
  timeline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const body = {
      caseId: formData.get("caseId"),
      contactEmail: formData.get("contactEmail"),
      contactPhone: formData.get("contactPhone"),
      scamType: formData.get("scamType"),
      amount: formData.get("amount"),
      currency: formData.get("currency"),
      timeline: formData.get("timeline"),
      description: formData.get("description"),
    }
    const parsed = SubmitCaseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const caseData: Inserts<"cases"> = {
      case_id: parsed.data.caseId,
      victim_email: parsed.data.contactEmail,
      victim_phone: (parsed.data.contactPhone as string | null) ?? null,
      scam_type: parsed.data.scamType,
      amount: parsed.data.amount ? Number.parseFloat(parsed.data.amount as string) : null,
      currency: (parsed.data.currency as string) || null,
      timeline: (parsed.data.timeline as string) || null,
      description: (parsed.data.description as string) || null,
      status: "Intake",
      priority: "normal",
    }

    const { data: caseRecord, error: caseError } = await supabase
      .from("cases")
      .insert(caseData)
      .select()
      .single()

    if (caseError) {
      console.error("[v0] Error saving case to Supabase:", caseError)
      throw caseError
    }

    const defaultAgentId = process.env.DEFAULT_AGENT_ID || (await getDefaultAgentId())

    const { error: chatRoomError } = await supabase.from("chat_rooms").insert({
      case_id: (caseRecord as Case).id,
      victim_email: caseData.victim_email,
      assigned_agent_id: defaultAgentId ?? null,
    })

    if (chatRoomError) {
      console.error("[v0] Error creating chat room:", chatRoomError)
    }

    const formspreeEndpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || "https://formspree.io/f/xeolvgjp"

    try {
      const forwardData = new FormData()
      for (const [key, value] of formData.entries()) {
        forwardData.append(key, value as Blob | string)
      }

      await fetch(formspreeEndpoint, {
        method: "POST",
        body: forwardData,
      })
    } catch (formspreeError) {
      console.error("[v0] Formspree submission failed:", formspreeError)
    }

    return NextResponse.json({
      success: true,
      caseId: caseData.case_id,
      message: "Case submitted successfully",
    })
  } catch (error) {
    console.error("[v0] Case submission error:", error)
    return NextResponse.json({ success: false, error: "Failed to submit case" }, { status: 500 })
  }
}
