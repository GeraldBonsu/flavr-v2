import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlanClient from './PlanClient'

export default async function PlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('goal, dietary_restrictions')
    .eq('id', user.id)
    .single()

  return <PlanClient profile={profile} />
}
