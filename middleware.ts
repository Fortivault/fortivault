import { NextResponse as EdgeNextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Lightweight edge-safe middleware: avoid importing server-only modules here to prevent
// "Code generation from strings disallowed" and related runtime errors in the edge runtime.
export function middleware(_request: NextRequest) {
  return EdgeNextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
