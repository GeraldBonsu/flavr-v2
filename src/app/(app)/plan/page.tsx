import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlanClient from './PlanClient'

export default async function PlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('goal, dietary_restrictions, subscription_tier, age, weight_kg, height_cm, activity_level, fitness_goal, target_calories, target_protein_g, target_carbs_g, target_fat_g, estimated_tdee, expenditure_updated_at, calorie_display_mode')
    .eq('id', user.id)
    .single()

  return <PlanClient profile={profile} userId={user.id} />
}
