import { NextResponse } from "next/server"

import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set("agent_session", "", { httpOnly: true, secure: true, sameSite: "none", path: "/", maxAge: 0 })
  return res
}
