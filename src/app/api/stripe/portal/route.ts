import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const service = createServiceClient()

  const { data: profile } = await service
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id ?? null

  // Backfill for subscribers who purchased before stripe_customer_id was captured.
  if (!customerId && user.email) {
    const existing = await stripe.customers.list({ email: user.email, limit: 1 })
    if (existing.data[0]) {
      customerId = existing.data[0].id
      await service.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }
  }

  if (!customerId) {
    return NextResponse.json({ error: 'No billing account found for this user' }, { status: 404 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/subscription`,
  })

  return NextResponse.json({ url: session.url })
}
