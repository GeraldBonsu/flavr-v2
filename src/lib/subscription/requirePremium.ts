import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export type SubscriptionTier = 'free' | 'premium'

export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('subscription_tier').eq('id', userId).single()
  return (data?.subscription_tier as SubscriptionTier) ?? 'free'
}

// For API routes: returns a ready-to-return NextResponse if blocked, or null if OK to proceed.
export async function requirePremiumApi(userId: string): Promise<NextResponse | null> {
  const tier = await getUserTier(userId)
  if (tier !== 'premium') {
    return NextResponse.json({ error: 'Premium required', code: 'PREMIUM_REQUIRED' }, { status: 403 })
  }
  return null
}
