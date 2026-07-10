export type FitnessGoal = 'lose_weight' | 'gain_muscle' | 'maintain' | 'recomp'

export interface NutritionTargets {
  target_calories: number
  target_protein_g: number
  target_carbs_g: number
  target_fat_g: number
}

const GOAL_CALORIE_OFFSET: Record<FitnessGoal, { pct: number; minKcal: number; maxKcal: number }> = {
  lose_weight: { pct: -0.20, minKcal: -1000, maxKcal: -250 },
  gain_muscle: { pct: 0.10,  minKcal: 200,   maxKcal: 500 },
  maintain:    { pct: 0,     minKcal: 0,     maxKcal: 0 },
  recomp:      { pct: -0.05, minKcal: -250,  maxKcal: -100 },
}

const GOAL_PROTEIN_G_PER_KG: Record<FitnessGoal, number> = {
  lose_weight: 2.2,
  gain_muscle: 1.8,
  maintain:    1.6,
  recomp:      2.0,
}

const GOAL_FAT_PCT: Record<FitnessGoal, number> = {
  lose_weight: 0.25,
  gain_muscle: 0.25,
  maintain:    0.30,
  recomp:      0.25,
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function deriveTargetsFromTDEE(
  estimatedTDEE: number,
  fitnessGoal: FitnessGoal | null,
  weightKg: number | null
): NutritionTargets {
  const goal = fitnessGoal ?? 'maintain'
  const offset = GOAL_CALORIE_OFFSET[goal]
  const rawDelta = offset.pct === 0 ? 0 : clamp(estimatedTDEE * offset.pct, offset.minKcal, offset.maxKcal)
  const targetCalories = Math.round(estimatedTDEE + rawDelta)

  const weight = weightKg ?? 70
  const proteinG = Math.round(GOAL_PROTEIN_G_PER_KG[goal] * weight)

  let fatPct = GOAL_FAT_PCT[goal]
  let fatG = Math.round((targetCalories * fatPct) / 9)
  let remainderKcal = targetCalories - proteinG * 4 - fatG * 9

  if (remainderKcal < 0) {
    // Step down fat% once and recompute — protein takes priority
    fatPct = 0.20
    fatG = Math.round((targetCalories * fatPct) / 9)
    remainderKcal = targetCalories - proteinG * 4 - fatG * 9
  }

  const carbsG = Math.max(0, Math.round(remainderKcal / 4))

  return {
    target_calories: targetCalories,
    target_protein_g: proteinG,
    target_carbs_g: carbsG,
    target_fat_g: fatG,
  }
}
