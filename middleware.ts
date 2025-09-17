import { NextResponse as EdgeNextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

// Enhanced middleware with admin route protection
export async function middleware(request: NextRequest) {
  // Apply Supabase session management and admin protection
  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
