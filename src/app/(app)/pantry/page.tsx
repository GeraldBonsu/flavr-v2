import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PantryClient from './PantryClient'

export default async function PantryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: items } = await supabase
    .from('pantry_items')
    .select('id, ingredient, category, added_at')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false })

  return <PantryClient userId={user.id} initialItems={items ?? []} />
}
