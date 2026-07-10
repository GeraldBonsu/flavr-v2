export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light:     1.375,
  moderate:  1.55,
  active:    1.725,
  very_active: 1.9,
}

export function calcTDEE(weight: number, height: number, age: number, activity: ActivityLevel): number {
  // Mifflin-St Jeor (gender-neutral: average of male+female)
  const bmrMale   = 10 * weight + 6.25 * height - 5 * age + 5
  const bmrFemale = 10 * weight + 6.25 * height - 5 * age - 161
  const bmr = (bmrMale + bmrFemale) / 2
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity])
}
