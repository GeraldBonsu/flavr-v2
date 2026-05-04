import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LearnClient from './LearnClient'

export default async function LearnPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <LearnClient />
}
