import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RecipeClient from './RecipeClient'

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: recipe } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!recipe) notFound()

  const { data: feedback } = await supabase
    .from('recipe_feedback')
    .select('id, rating, cooked')
    .eq('recipe_id', id)
    .eq('user_id', user.id)
    .single()

  return <RecipeClient recipe={recipe} existingFeedback={feedback} />
}
