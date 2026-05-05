import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CookClient from './CookClient'

export default async function CookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: recipe } = await supabase
    .from('recipes')
    .select('id, name, emoji, steps')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!recipe) notFound()

  return <CookClient recipeId={recipe.id} recipeName={recipe.name} emoji={recipe.emoji ?? '🍳'} steps={recipe.steps ?? []} />
}
