import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingBanner from '@/components/app/OnboardingBanner'
import CookedCheck from '@/components/app/CookedCheck'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed_at, name, initials, subscription_tier')
    .eq('id', user.id)
    .single()

  // Check for recipes saved > 24h ago that haven't been asked about
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: oldRecipes } = await supabase
    .from('recipes')
    .select('id, name')
    .eq('user_id', user.id)
    .lt('saved_at', cutoff)
    .limit(5)

  // Filter to recipes with no cooked feedback yet
  let uncookedRecipeId: string | null = null
  let uncookedRecipeName: string | null = null
  if (oldRecipes && oldRecipes.length > 0) {
    for (const r of oldRecipes) {
      const { data: fb } = await supabase
        .from('recipe_feedback')
        .select('cooked')
        .eq('recipe_id', r.id)
        .eq('user_id', user.id)
        .single()

      if (!fb || fb.cooked === null) {
        uncookedRecipeId = r.id
        uncookedRecipeName = r.name
        break
      }
    }
  }

  return (
    <>
      {profile && !profile.onboarding_completed_at && (
        <OnboardingBanner />
      )}
      {uncookedRecipeId && (
        <CookedCheck recipeId={uncookedRecipeId} recipeName={uncookedRecipeName ?? 'your recipe'} />
      )}
      {children}
    </>
  )
}
