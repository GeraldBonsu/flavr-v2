export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          initials: string | null
          goal: string | null
          diet: string[] | null
          intent: 'eat_better' | 'fitness_goal' | 'explore_culture' | 'casual' | null
          fitness_goal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'recomp' | null
          age: number | null
          weight_kg: number | null
          height_cm: number | null
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
          target_calories: number | null
          target_protein_g: number | null
          target_carbs_g: number | null
          target_fat_g: number | null
          estimated_tdee: number | null
          expenditure_updated_at: string | null
          expenditure_confidence: 'seed' | 'low' | 'medium' | 'high' | null
          dietary_restrictions: string[] | null
          cultural_preferences: string[] | null
          subscription_tier: 'free' | 'premium'
          stripe_customer_id: string | null
          calorie_display_mode: 'remaining' | 'consumed'
          notification_preferences: Json
          language: string
          onboarding_completed_at: string | null
          provider: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          initials?: string | null
          goal?: string | null
          diet?: string[] | null
          intent?: 'eat_better' | 'fitness_goal' | 'explore_culture' | 'casual' | null
          fitness_goal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'recomp' | null
          age?: number | null
          weight_kg?: number | null
          height_cm?: number | null
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
          target_calories?: number | null
          target_protein_g?: number | null
          target_carbs_g?: number | null
          target_fat_g?: number | null
          estimated_tdee?: number | null
          expenditure_updated_at?: string | null
          expenditure_confidence?: 'seed' | 'low' | 'medium' | 'high' | null
          dietary_restrictions?: string[] | null
          cultural_preferences?: string[] | null
          subscription_tier?: 'free' | 'premium'
          stripe_customer_id?: string | null
          calorie_display_mode?: 'remaining' | 'consumed'
          notification_preferences?: Json
          language?: string
          onboarding_completed_at?: string | null
          provider?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          initials?: string | null
          goal?: string | null
          diet?: string[] | null
          intent?: 'eat_better' | 'fitness_goal' | 'explore_culture' | 'casual' | null
          fitness_goal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'recomp' | null
          age?: number | null
          weight_kg?: number | null
          height_cm?: number | null
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
          target_calories?: number | null
          target_protein_g?: number | null
          target_carbs_g?: number | null
          target_fat_g?: number | null
          estimated_tdee?: number | null
          expenditure_updated_at?: string | null
          expenditure_confidence?: 'seed' | 'low' | 'medium' | 'high' | null
          dietary_restrictions?: string[] | null
          cultural_preferences?: string[] | null
          subscription_tier?: 'free' | 'premium'
          stripe_customer_id?: string | null
          calorie_display_mode?: 'remaining' | 'consumed'
          notification_preferences?: Json
          language?: string
          onboarding_completed_at?: string | null
          provider?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          id: string
          user_id: string
          name: string
          emoji: string | null
          cuisine: string | null
          cook_time: string | null
          servings: number | null
          calories: number | null
          protein: string | null
          carbs: string | null
          fats: string | null
          ingredients: Json | null
          steps: string[] | null
          goal_note: string | null
          goal: string | null
          saved_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          emoji?: string | null
          cuisine?: string | null
          cook_time?: string | null
          servings?: number | null
          calories?: number | null
          protein?: string | null
          carbs?: string | null
          fats?: string | null
          ingredients?: Json | null
          steps?: string[] | null
          goal_note?: string | null
          goal?: string | null
          saved_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          emoji?: string | null
          cuisine?: string | null
          cook_time?: string | null
          servings?: number | null
          calories?: number | null
          protein?: string | null
          carbs?: string | null
          fats?: string | null
          ingredients?: Json | null
          steps?: string[] | null
          goal_note?: string | null
          goal?: string | null
          saved_at?: string
          created_at?: string
        }
        Relationships: []
      }
      recipe_feedback: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          cooked: boolean | null
          rating: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          cooked?: boolean | null
          rating?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          cooked?: boolean | null
          rating?: number | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          event_name: string
          properties: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_name: string
          properties?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_name?: string
          properties?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      pantry_items: {
        Row: {
          id: string
          user_id: string
          ingredient: string
          category: string
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ingredient: string
          category?: string
          added_at?: string
        }
        Update: {
          ingredient?: string
          category?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          id: string
          user_id: string | null
          type: string
          name: string
          email: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
          name: string
          email: string
          message: string
          created_at?: string
        }
        Update: {
          type?: string
          name?: string
          email?: string
          message?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          id: string
          user_id: string
          weight_kg: number
          logged_at: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          weight_kg: number
          logged_at?: string
          note?: string | null
          created_at?: string
        }
        Update: {
          weight_kg?: number
          logged_at?: string
          note?: string | null
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          id: string
          user_id: string
          logged_at: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          name: string
          calories: number
          protein_g: number
          carbs_g: number
          fat_g: number
          source: 'manual' | 'photo' | 'recipe'
          recipe_id: string | null
          items: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          logged_at?: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          name: string
          calories: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          source: 'manual' | 'photo' | 'recipe'
          recipe_id?: string | null
          items?: Json | null
          created_at?: string
        }
        Update: {
          logged_at?: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          name?: string
          calories?: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          source?: 'manual' | 'photo' | 'recipe'
          recipe_id?: string | null
          items?: Json | null
        }
        Relationships: []
      }
      expenditure_history: {
        Row: {
          id: string
          user_id: string
          week_start: string
          estimated_tdee: number
          target_calories: number
          target_protein_g: number
          target_carbs_g: number
          target_fat_g: number
          data_points: number
          confidence: 'seed' | 'low' | 'medium' | 'high'
          method: 'seed_mifflin' | 'trend_14d' | 'trend_7d'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start: string
          estimated_tdee: number
          target_calories: number
          target_protein_g: number
          target_carbs_g: number
          target_fat_g: number
          data_points: number
          confidence: 'seed' | 'low' | 'medium' | 'high'
          method: 'seed_mifflin' | 'trend_14d' | 'trend_7d'
          created_at?: string
        }
        Update: {
          estimated_tdee?: number
          target_calories?: number
          target_protein_g?: number
          target_carbs_g?: number
          target_fat_g?: number
          data_points?: number
          confidence?: 'seed' | 'low' | 'medium' | 'high'
          method?: 'seed_mifflin' | 'trend_14d' | 'trend_7d'
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
