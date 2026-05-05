import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SubscriptionClient from './SubscriptionClient'

export default async function SubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, name')
    .eq('id', user.id)
    .single()

  return (
    <SubscriptionClient
      tier={profile?.subscription_tier ?? 'free'}
      name={profile?.name ?? ''}
    />
  )
}
