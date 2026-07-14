import type { ActivityLevel } from '@/lib/nutrition/tdee'
import type { FitnessGoal } from '@/lib/nutrition/targets'

export interface DiaryProfile {
  age: number | null
  weight_kg: number | null
  height_cm: number | null
  activity_level: ActivityLevel | null
  fitness_goal: FitnessGoal | null
  target_calories: number | null
  target_protein_g: number | null
  target_carbs_g: number | null
  target_fat_g: number | null
  estimated_tdee: number | null
  expenditure_updated_at: string | null
  subscription_tier: 'free' | 'premium'
  calorie_display_mode: 'remaining' | 'consumed'
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface MealItem {
  name: string
  quantity: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export interface MealLog {
  id: string
  logged_at: string
  meal_type: MealType
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  source: 'manual' | 'photo' | 'recipe'
  recipe_id: string | null
  items: MealItem[] | null
}

export interface MealEstimate {
  summary: string
  items: MealItem[]
  total: { calories: number; protein_g: number; carbs_g: number; fat_g: number }
  confidence: 'low' | 'medium' | 'high'
  notes?: string
}
