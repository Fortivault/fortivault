import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json({ error: "Deprecated. Use Supabase Auth (supabase.auth.signInWithPassword) on the client." }, { status: 405 })
}
