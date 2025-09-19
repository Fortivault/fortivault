import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const cookieStore = cookies()
    const token = cookieStore.get("agent_session")?.value
    if (!token) return new NextResponse("Unauthorized", { status: 401 })

    // Get agent id from session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { data: agent } = await supabase
      .from("agents")
      .select("id")
      .eq("user_id", session.user.id)
      .single()
    if (!agent) return new NextResponse("Unauthorized", { status: 401 })

    const body = await request.json()
    const {
      fraudType,
      amount,
      timeSinceIncident,
      paymentMethod,
      hasCommunication,
      hasEvidence,
      probability,
      estimatedAmount,
      timeframe,
      riskLevel,
    } = body

    const { error } = await supabase.from("recovery_results").insert({
      agent_id: agent.id,
      fraud_type: fraudType,
      amount: amount,
      time_since_incident: timeSinceIncident,
      payment_method: paymentMethod,
      has_communication: hasCommunication,
      has_evidence: hasEvidence,
      probability,
      estimated_amount: estimatedAmount,
      timeframe,
      risk_level: riskLevel,
    })
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving recovery result:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
