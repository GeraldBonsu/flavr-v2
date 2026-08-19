import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const service = createServiceClient()

  // Cancel any active Stripe subscription first so deletion doesn't leave a zombie billing record.
  const { data: profile } = await service
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (profile?.stripe_customer_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' })
      const subscriptions = await stripe.subscriptions.list({ customer: profile.stripe_customer_id, status: 'active' })
      await Promise.all(subscriptions.data.map(sub => stripe.subscriptions.cancel(sub.id)))
    } catch (err) {
      console.error('[account delete] failed to cancel stripe subscription', err)
      // Don't block account deletion on billing cleanup failing.
    }
  }

  // profiles (and every table referencing it) cascade-deletes via the auth.users FK.
  const { error } = await service.auth.admin.deleteUser(user.id)
  if (error) {
    console.error('[account delete] failed', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
