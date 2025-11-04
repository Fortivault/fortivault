import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Inserts } from "@/types/database.types"
import type { Case } from "@/types/entities"
import { z } from "zod"
import { getDefaultAgentId } from "@/lib/agents/default-agent"
import { badRequest, serverError, ok } from "@/lib/api/response"

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
      return badRequest("Invalid input")
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

    const formspreeEndpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT

    try {
      const forwardData = new FormData()

      // Ensure evidence bucket exists
      const bucketId = "evidence"
      const { data: bucketInfo } = await supabase.storage.getBucket(bucketId)
      if (!bucketInfo) {
        await supabase.storage.createBucket(bucketId, { public: false })
      }

      // Upload any evidence files and collect URLs
      const evidenceUrls: string[] = []
      const fileCount = Number.parseInt((formData.get("evidenceFileCount") as string) || "0", 10)
      const allowedTypes = new Set([
        "image/png",
        "image/jpeg",
        "image/webp",
        "application/pdf",
        "text/plain",
      ])
      const maxSizeBytes = 10 * 1024 * 1024 // 10MB per file

      for (let i = 0; i < Math.min(fileCount, 20); i++) {
        const file = formData.get(`evidenceFile_${i}`) as File | null
        if (file && typeof (file as any).arrayBuffer === "function" && (file as any).size > 0) {
          const type = (file as any).type || "application/octet-stream"
          const size = (file as any).size || 0
          if (!allowedTypes.has(type)) {
            console.warn(`[upload] Rejected file type: ${type}`)
            continue
          }
          if (size > maxSizeBytes) {
            console.warn(`[upload] Rejected file too large: ${size}`)
            continue
          }

          const safeName = ((file as any).name || `evidence_${i}`).replace(/[^a-zA-Z0-9._-]/g, "_")
          const path = `${parsed.data.caseId}/${Date.now()}_${i}_${safeName}`
          const bytes = new Uint8Array(await file.arrayBuffer())

          let { error: uploadError } = await supabase.storage
            .from(bucketId)
            .upload(path, bytes, { contentType: type })

          if (uploadError && uploadError.message?.toLowerCase().includes("bucket")) {
            await supabase.storage.createBucket(bucketId, { public: false })
            ;({ error: uploadError } = await supabase.storage
              .from(bucketId)
              .upload(path, bytes, { contentType: type }))
          }

          if (!uploadError) {
            const { data: signed, error: signErr } = await supabase.storage
              .from(bucketId)
              .createSignedUrl(path, 60 * 60 * 24 * 30) // 30 days
            if (!signErr && signed?.signedUrl) {
              evidenceUrls.push(signed.signedUrl)
            } else {
              const { data: pub } = supabase.storage.from(bucketId).getPublicUrl(path)
              if (pub?.publicUrl) evidenceUrls.push(pub.publicUrl)
            }
          }
        }
      }

      // Forward all non-file fields with proper formatting
      for (const [key, value] of formData.entries()) {
        if (key.startsWith("evidenceFile_")) continue
        if (value instanceof Blob) continue
        forwardData.append(key, value as string)
      }

      // Add formatted fields for better Formspree display
      const scamTypeLabels: Record<string, string> = {
        crypto: "Cryptocurrency Fraud",
        fiat: "Traditional Financial Fraud", 
        other: "Other Fraud Types"
      }
      
      forwardData.append("scamTypeFormatted", scamTypeLabels[formData.get("scamType") as string] || formData.get("scamType") as string)
      
      // Parse and format transaction hashes and bank references
      try {
        const transactionHashes = JSON.parse(formData.get("transactionHashes") as string || "[]")
        const bankReferences = JSON.parse(formData.get("bankReferences") as string || "[]")
        
        if (transactionHashes.length > 0) {
          forwardData.append("transactionHashesFormatted", transactionHashes.join("\n"))
          forwardData.append("transactionHashesCount", transactionHashes.length.toString())
        }
        
        if (bankReferences.length > 0) {
          forwardData.append("bankReferencesFormatted", bankReferences.join("\n"))
          forwardData.append("bankReferencesCount", bankReferences.length.toString())
        }
      } catch (error) {
        console.error("Error parsing transaction data:", error)
      }

      // Add evidence URLs instead of raw files
      if (evidenceUrls.length) {
        forwardData.append("evidenceFileUrls", JSON.stringify(evidenceUrls))
        forwardData.append("evidenceFileUrlsText", evidenceUrls.join("\n"))
        forwardData.append("evidenceFileCount", evidenceUrls.length.toString())
      }

      // Add formatted submission info
      forwardData.append("submissionSource", "Fortivault Fraud Reporting Wizard")
      forwardData.append("caseStatus", "New Submission")
      forwardData.append("platform", "Fortivault")
      
      // Format amount with currency
      const amount = formData.get("amount") as string
      const currency = formData.get("currency") as string
      if (amount && currency) {
        forwardData.append("amountFormatted", `${amount} ${currency}`)
      }

      // Add timeline formatting
      const timeline = formData.get("timeline") as string
      const timelineLabels: Record<string, string> = {
        "today": "Today",
        "yesterday": "Yesterday", 
        "this-week": "This week",
        "last-week": "Last week",
        "this-month": "This month",
        "1-3-months": "1-3 months ago",
        "3-6-months": "3-6 months ago",
        "6-months-plus": "More than 6 months ago"
      }
      if (timeline) {
        forwardData.append("timelineFormatted", timelineLabels[timeline] || timeline)
      }

      // Add summary for easy reading
      const description = formData.get("description") as string
      const scamType = formData.get("scamType") as string
      const contactEmail = formData.get("contactEmail") as string
      
      let summary = `New fraud case submitted by ${contactEmail}\n`
      summary += `Case ID: ${parsed.data.caseId}\n`
      summary += `Type: ${scamTypeLabels[scamType] || scamType}\n`
      if (amount && currency) {
        summary += `Amount: ${amount} ${currency}\n`
      }
      if (timeline) {
        summary += `Timeline: ${timelineLabels[timeline] || timeline}\n`
      }
      summary += `Evidence Files: ${evidenceUrls.length} uploaded\n`
      
      forwardData.append("caseSummary", summary)

      const formspreeResponse = await fetch(formspreeEndpoint, {
        method: "POST",
        body: forwardData,
      })

      if (formspreeResponse.ok) {
        console.log("[v0] Formspree submission successful for case:", parsed.data.caseId)
      } else {
        console.error("[v0] Formspree submission failed with status:", formspreeResponse.status)
        const errorText = await formspreeResponse.text()
        console.error("[v0] Formspree error response:", errorText)
      }
    } catch (formspreeError) {
      console.error("[v0] Formspree submission failed:", formspreeError)
    }

    return ok({ success: true, caseId: caseData.case_id, message: "Case submitted successfully" })
  } catch (error) {
    console.error("[v0] Case submission error:", error)
    return serverError("Failed to submit case")
  }
}
