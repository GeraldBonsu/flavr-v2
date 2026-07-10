import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { recomputeForUser } from '@/lib/nutrition/recompute'

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, age, weight_kg, height_cm, activity_level, fitness_goal, estimated_tdee')
    .eq('subscription_tier', 'premium')

  const results = await Promise.allSettled(
    (profiles ?? []).map(profile => recomputeForUser(supabase, profile))
  )

  const processed = results.filter(r => r.status === 'fulfilled' && r.value === 'updated').length
  const skipped = results.filter(r => r.status === 'fulfilled' && r.value === 'skipped').length
  const errors = results.filter(r => r.status === 'rejected').length

  return NextResponse.json({ processed, skipped, errors, total: profiles?.length ?? 0 })
}
