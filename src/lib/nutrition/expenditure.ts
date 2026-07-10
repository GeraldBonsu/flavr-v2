import { calcTDEE, type ActivityLevel } from './tdee'
import { deriveTargetsFromTDEE, type FitnessGoal } from './targets'

const KCAL_PER_KG = 7700
const COMPLETE_MIN_MEAL_TYPES = 2
const COMPLETE_MIN_CALORIES = 800

export interface ExpenditureProfileInput {
  age: number | null
  weight_kg: number | null
  height_cm: number | null
  activity_level: ActivityLevel | null
  fitness_goal: FitnessGoal | null
  estimated_tdee: number | null
}

export interface ExpenditureInputs {
  profile: ExpenditureProfileInput
  weightLogs: { logged_at: string; weight_kg: number }[]
  mealLogs: { logged_at: string; calories: number; meal_type: string }[]
}

export interface ExpenditureResult {
  estimatedTDEE: number
  targetCalories: number
  targetProteinG: number
  targetCarbsG: number
  targetFatG: number
  confidence: 'seed' | 'low' | 'medium' | 'high'
  method: 'seed_mifflin' | 'trend_14d' | 'trend_7d'
  dataPoints: number
}

function toDayIndex(dateStr: string): number {
  return Math.floor(Date.parse(`${dateStr.slice(0, 10)}T00:00:00Z`) / 86400000)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function linearRegressionSlope(points: { x: number; y: number }[]): number | null {
  const n = points.length
  if (n < 2) return null
  const meanX = points.reduce((s, p) => s + p.x, 0) / n
  const meanY = points.reduce((s, p) => s + p.y, 0) / n
  let numerator = 0
  let denominator = 0
  for (const p of points) {
    numerator += (p.x - meanX) * (p.y - meanY)
    denominator += (p.x - meanX) ** 2
  }
  if (denominator === 0) return null
  return numerator / denominator
}

function isCompleteDay(totalCalories: number, mealTypeCount: number): boolean {
  return mealTypeCount >= COMPLETE_MIN_MEAL_TYPES || totalCalories >= COMPLETE_MIN_CALORIES
}

/**
 * Recomputes a user's estimated TDEE and nutrition targets from their logged weight trend
 * and food intake, smoothing against the previous estimate. Returns null when there isn't
 * enough data to produce even a seed estimate (profile incomplete, no prior estimate).
 */
export function computeExpenditureUpdate(inputs: ExpenditureInputs): ExpenditureResult | null {
  const { profile, weightLogs, mealLogs } = inputs
  const todayIdx = toDayIndex(new Date().toISOString())

  const dailyMap = new Map<string, { totalCalories: number; mealTypes: Set<string> }>()
  for (const log of mealLogs) {
    const day = log.logged_at.slice(0, 10)
    const entry = dailyMap.get(day) ?? { totalCalories: 0, mealTypes: new Set<string>() }
    entry.totalCalories += log.calories
    entry.mealTypes.add(log.meal_type)
    dailyMap.set(day, entry)
  }
  const dailyTotals = Array.from(dailyMap.entries()).map(([date, v]) => ({
    date,
    totalCalories: v.totalCalories,
    mealCount: v.mealTypes.size,
  }))

  const seedFromProfile = (): number | null => {
    if (profile.age && profile.weight_kg && profile.height_cm && profile.activity_level) {
      return calcTDEE(profile.weight_kg, profile.height_cm, profile.age, profile.activity_level)
    }
    return null
  }

  const buildResult = (
    estimatedTDEE: number,
    confidence: ExpenditureResult['confidence'],
    method: ExpenditureResult['method'],
    dataPoints: number
  ): ExpenditureResult => {
    const targets = deriveTargetsFromTDEE(estimatedTDEE, profile.fitness_goal, profile.weight_kg)
    return {
      estimatedTDEE,
      targetCalories: targets.target_calories,
      targetProteinG: targets.target_protein_g,
      targetCarbsG: targets.target_carbs_g,
      targetFatG: targets.target_fat_g,
      confidence,
      method,
      dataPoints,
    }
  }

  const seedOrKeepExisting = (dataPoints: number): ExpenditureResult | null => {
    if (profile.estimated_tdee == null) {
      const seed = seedFromProfile()
      if (seed == null) return null
      return buildResult(seed, 'seed', 'seed_mifflin', 0)
    }
    return buildResult(profile.estimated_tdee, 'low', 'seed_mifflin', dataPoints)
  }

  let chosenWindowDays: 14 | 7 | null = null
  for (const windowDays of [14, 7] as const) {
    const cutoffIdx = todayIdx - windowDays
    const windowWeightCount = weightLogs.filter(w => toDayIndex(w.logged_at) >= cutoffIdx).length
    const windowCompleteDayCount = dailyTotals.filter(
      d => toDayIndex(d.date) >= cutoffIdx && isCompleteDay(d.totalCalories, d.mealCount)
    ).length
    const minWeightLogs = windowDays === 14 ? 4 : 2
    const minCompleteDays = windowDays === 14 ? 5 : 3
    if (windowWeightCount >= minWeightLogs && windowCompleteDayCount >= minCompleteDays) {
      chosenWindowDays = windowDays
      break
    }
  }

  if (chosenWindowDays == null) {
    return seedOrKeepExisting(dailyTotals.length)
  }

  const method = chosenWindowDays === 14 ? 'trend_14d' : 'trend_7d'
  const cutoffIdx = todayIdx - chosenWindowDays
  const windowWeightPoints = weightLogs
    .filter(w => toDayIndex(w.logged_at) >= cutoffIdx)
    .map(w => ({ x: toDayIndex(w.logged_at), y: w.weight_kg }))
  const windowCompleteDays = dailyTotals.filter(
    d => toDayIndex(d.date) >= cutoffIdx && isCompleteDay(d.totalCalories, d.mealCount)
  )

  const slopeKgPerDay = linearRegressionSlope(windowWeightPoints)
  if (slopeKgPerDay == null) {
    return seedOrKeepExisting(windowCompleteDays.length)
  }

  const weeklyWeightChangeKg = slopeKgPerDay * 7
  const avgDailyCalories = windowCompleteDays.reduce((s, d) => s + d.totalCalories, 0) / windowCompleteDays.length
  const dailyEnergyBalance = (weeklyWeightChangeKg * KCAL_PER_KG) / 7
  const impliedTDEE = avgDailyCalories - dailyEnergyBalance

  let previous: number
  let alpha: number
  if (profile.estimated_tdee == null) {
    // First real data point: don't over-trust the population-average seed formula.
    previous = seedFromProfile() ?? impliedTDEE
    alpha = 0.5
  } else {
    // Steady state: ~4-week effective smoothing memory, filters week-to-week noise
    // (water weight, imperfect logging) while still catching a genuine plateau within a month.
    previous = profile.estimated_tdee
    alpha = 0.25
  }

  const blended = alpha * impliedTDEE + (1 - alpha) * previous
  // Sanity clamp: guard against one bad week of data blowing up the estimate.
  const newEstimatedTDEE = Math.round(clamp(blended, previous * 0.8, previous * 1.2))

  const confidence: ExpenditureResult['confidence'] =
    windowCompleteDays.length >= 10 ? 'high' : windowCompleteDays.length >= 5 ? 'medium' : 'low'

  return buildResult(newEstimatedTDEE, confidence, method, windowCompleteDays.length)
}
