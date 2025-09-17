import { NextResponse } from "next/server"

import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ success: true })
  const isProd = process.env.NODE_ENV === "production"
  res.cookies.set("agent_session", "", { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax", path: "/", maxAge: 0 })
  return res
}
