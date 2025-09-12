import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'

const Schema = z.object({ email: z.string().email(), otp: z.string().length(6), caseId: z.string().min(3) })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const { email, otp, caseId } = parsed.data
    const supabase = createAdminClient()
    const { data: rec, error } = await supabase
      .from('email_otp')
      .select('id, code_hash, expires_at, attempts, consumed_at')
      .eq('email', email)
      .eq('case_id', caseId)
      .maybeSingle()

    if (error || !rec) return NextResponse.json({ error: 'Verification code not found. Request a new one.' }, { status: 400 })
    if (rec.consumed_at) return NextResponse.json({ error: 'Code already used. Request a new one.' }, { status: 400 })
    if (new Date(rec.expires_at).getTime() < Date.now()) return NextResponse.json({ error: 'Code expired. Request a new one.' }, { status: 400 })

    const ok = await bcrypt.compare(otp, rec.code_hash)
    if (!ok) {
      const { error: updErr } = await supabase.from('email_otp').update({ attempts: (rec.attempts || 0) + 1 }).eq('id', rec.id)
      if (updErr) console.error('[v0] OTP attempts update error (confirm):', updErr)
      return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 400 })
    }

    const { error: consumeErr } = await supabase.from('email_otp').update({ consumed_at: new Date().toISOString() }).eq('id', rec.id)
    if (consumeErr) console.error('[v0] OTP consume error (confirm):', consumeErr)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[v0] confirm-email error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
