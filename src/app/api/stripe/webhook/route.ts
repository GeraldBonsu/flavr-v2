import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/service'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })

// Disable body parsing — Stripe needs the raw body to verify the signature
export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const body = await req.text()
  const sig  = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId  = session.metadata?.user_id

    if (userId) {
      const supabase = createServiceClient()
      await supabase
        .from('profiles')
        .update({ subscription_tier: 'premium' })
        .eq('id', userId)
    }
  }

  return NextResponse.json({ received: true })
}
