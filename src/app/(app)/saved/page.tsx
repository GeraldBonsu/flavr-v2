import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SavedClient from './SavedClient'

export default async function SavedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, name, emoji, cuisine, calories, protein, cook_time, goal, saved_at')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })

  return <SavedClient recipes={recipes ?? []} />
}
