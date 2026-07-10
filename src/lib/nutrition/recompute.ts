import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import { computeExpenditureUpdate, type ExpenditureProfileInput } from './expenditure'

function getWeekStartISO(d: Date): string {
  const day = d.getUTCDay() // 0=Sun..6=Sat
  const diffToMonday = (day + 6) % 7
  const monday = new Date(d)
  monday.setUTCDate(d.getUTCDate() - diffToMonday)
  return monday.toISOString().slice(0, 10)
}

/**
 * Recomputes and persists one user's expenditure estimate + nutrition targets.
 * Must be called with a service-role client — writes to expenditure_history
 * (insert-only via service role) and profiles.
 */
export async function recomputeForUser(
  supabase: SupabaseClient<Database>,
  profile: ExpenditureProfileInput & { id: string }
): Promise<'updated' | 'skipped'> {
  const since = new Date(Date.now() - 30 * 86400000).toISOString()

  const [{ data: weightLogs }, { data: mealLogs }] = await Promise.all([
    supabase.from('weight_logs').select('logged_at, weight_kg').eq('user_id', profile.id).gte('logged_at', since.slice(0, 10)),
    supabase.from('meal_logs').select('logged_at, calories, meal_type').eq('user_id', profile.id).gte('logged_at', since),
  ])

  const result = computeExpenditureUpdate({
    profile,
    weightLogs: weightLogs ?? [],
    mealLogs: mealLogs ?? [],
  })
  if (!result) return 'skipped'

  const weekStart = getWeekStartISO(new Date())

  await supabase.from('expenditure_history').upsert({
    user_id: profile.id,
    week_start: weekStart,
    estimated_tdee: result.estimatedTDEE,
    target_calories: result.targetCalories,
    target_protein_g: result.targetProteinG,
    target_carbs_g: result.targetCarbsG,
    target_fat_g: result.targetFatG,
    data_points: result.dataPoints,
    confidence: result.confidence,
    method: result.method,
  }, { onConflict: 'user_id,week_start' })

  await supabase.from('profiles').update({
    estimated_tdee: result.estimatedTDEE,
    target_calories: result.targetCalories,
    target_protein_g: result.targetProteinG,
    target_carbs_g: result.targetCarbsG,
    target_fat_g: result.targetFatG,
    expenditure_updated_at: new Date().toISOString(),
    expenditure_confidence: result.confidence,
  }).eq('id', profile.id)

  return 'updated'
}
