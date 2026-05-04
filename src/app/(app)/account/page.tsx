import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AccountClient from './AccountClient'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, initials, email, goal, dietary_restrictions, cultural_preferences, intent, fitness_goal, subscription_tier, onboarding_completed_at')
    .eq('id', user.id)
    .single()

  return <AccountClient profile={profile} email={user.email ?? ''} />
}
