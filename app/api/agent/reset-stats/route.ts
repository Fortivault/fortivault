import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAgentFromRequest } from '@/lib/agents/auth'
import { z } from 'zod'
import { appendAuditLog } from '@/lib/audit/log'

export async function POST(request: NextRequest) {
  try {
    // Zod validation (no body expected, but future-proof)
    const schema = z.object({})
    if (request.headers.get('content-type')?.includes('application/json')) {
      const body = await request.json().catch(() => ({}))
      const parsed = schema.safeParse(body)
      if (!parsed.success) {
        return new NextResponse(JSON.stringify({ error: 'Invalid input' }), { status: 400 })
      }
    }

    const agent = await getAgentFromRequest(request)
    if (!agent) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

  const supabase = await createClient()

    // Reset agent-specific analytics
    await supabase
      .from('agent_analytics')
      .update({
        cases_resolved: 0,
        success_rate: 0,
        avg_response_time: 0,
        total_recoveries: 0,
        performance_score: 0
      })
      .eq('agent_id', agent.id)

    // Reset case-related stats for this agent
    await supabase
      .from('agent_case_stats')
      .update({
        recovery_probability: 0,
        last_contact: null,
        performance_metrics: {},
      })
      .eq('agent_id', agent.id)

    // Audit log
    await appendAuditLog({
      actor: agent.id,
      action: 'reset_stats',
      resource: agent.id,
      details: { type: 'agent_stats_reset' },
    })

    return new NextResponse(
      JSON.stringify({ success: true }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Error resetting agent stats:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
}