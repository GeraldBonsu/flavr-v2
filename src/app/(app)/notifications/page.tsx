import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NotificationsClient from './NotificationsClient'
import type { Json } from '@/types/database.types'

interface NotifPrefs {
  weekly_recipes: boolean
  pantry_reminders: boolean
  cooking_tips: boolean
  meal_plan: boolean
}

function parsePrefs(raw: Json): NotifPrefs {
  const defaults: NotifPrefs = {
    weekly_recipes: true,
    pantry_reminders: true,
    cooking_tips: false,
    meal_plan: false,
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return defaults
  const r = raw as Record<string, unknown>
  return {
    weekly_recipes:   typeof r.weekly_recipes   === 'boolean' ? r.weekly_recipes   : defaults.weekly_recipes,
    pantry_reminders: typeof r.pantry_reminders === 'boolean' ? r.pantry_reminders : defaults.pantry_reminders,
    cooking_tips:     typeof r.cooking_tips     === 'boolean' ? r.cooking_tips     : defaults.cooking_tips,
    meal_plan:        typeof r.meal_plan        === 'boolean' ? r.meal_plan        : defaults.meal_plan,
  }
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('notification_preferences')
    .eq('id', user.id)
    .single()

  return (
    <NotificationsClient
      userId={user.id}
      initialPrefs={parsePrefs(profile?.notification_preferences ?? null)}
    />
  )
}
