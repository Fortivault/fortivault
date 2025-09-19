import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import bcrypt from "bcryptjs"

const schema = z.object({
  password: z.string().min(6),
  newPassword: z.string().min(6),
})

export async function POST(request: Request) {
  try {
  const supabase = await createClient()
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return new NextResponse("Invalid input", { status: 400 })
    }
    const {
      data: { session },
  } = await supabase.auth.getSession()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    // Get agent
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("password_hash")
      .eq("id", session.user.id)
      .single()
    if (agentError || !agent) {
      return new NextResponse("Agent not found", { status: 404 })
    }
    // Check current password
    const valid = await bcrypt.compare(parsed.data.password, agent.password_hash)
    if (!valid) {
      return new NextResponse("Incorrect password", { status: 403 })
    }
    // Hash new password
    const newHash = await bcrypt.hash(parsed.data.newPassword, 10)
    const { error } = await supabase
      .from("agents")
      .update({ password_hash: newHash })
      .eq("id", session.user.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error resetting agent password:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
