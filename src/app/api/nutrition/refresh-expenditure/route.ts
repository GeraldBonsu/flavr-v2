import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requirePremiumApi } from '@/lib/subscription/requirePremium'
import { recomputeForUser } from '@/lib/nutrition/recompute'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const gate = await requirePremiumApi(user.id)
  if (gate) return gate

  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('id, age, weight_kg, height_cm, activity_level, fitness_goal, estimated_tdee')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const status = await recomputeForUser(service, profile)
  return NextResponse.json({ status })
}
