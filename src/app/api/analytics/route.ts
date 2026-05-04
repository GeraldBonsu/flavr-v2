import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { Json } from '@/types/database.types'

export async function POST(request: Request) {
  try {
    const { event_name, properties } = await request.json() as {
      event_name: string
      properties?: Record<string, unknown>
    }

    if (!event_name) {
      return NextResponse.json({ error: 'event_name required' }, { status: 400 })
    }

    // Get user ID if authenticated (nullable — anonymous events allowed)
    let userId: string | null = null
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id ?? null
    } catch {
      // Not authenticated — track as anonymous
    }

    // Service client bypasses RLS to insert analytics
    const service = createServiceClient()
    await service.from('analytics_events').insert({
      user_id: userId,
      event_name,
      properties: (properties ?? null) as Json | null,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[analytics]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
