import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
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
    const updates: any = {}
    if (parsed.data.name) updates.name = parsed.data.name
    if (parsed.data.email) updates.email = parsed.data.email
    if (Object.keys(updates).length === 0) {
      return new NextResponse("No changes", { status: 400 })
    }
    const { error } = await supabase
      .from("agents")
      .update(updates)
      .eq("id", session.user.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating agent profile:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
