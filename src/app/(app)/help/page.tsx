import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HelpClient from './HelpClient'

export default async function HelpPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  return (
    <HelpClient
      userId={user.id}
      email={user.email ?? ''}
      name={profile?.name ?? ''}
    />
  )
}
