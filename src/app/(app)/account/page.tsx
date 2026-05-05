import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AccountClient from './AccountClient'

function calcStreak(dates: { created_at: string }[]): number {
  const days = [...new Set(dates.map(d => d.created_at.slice(0, 10)))].sort().reverse()
  if (days.length === 0) return 0
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (days[0] !== today && days[0] !== yesterday) return 0
  let streak = 1
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]!)
    const curr = new Date(days[i]!)
    const diff = (prev.getTime() - curr.getTime()) / 86400000
    if (diff === 1) streak++
    else break
  }
  return streak
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, savedRes, cookedRes, datesRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('name, initials, goal, dietary_restrictions, cultural_preferences, intent, fitness_goal, subscription_tier')
      .eq('id', user.id)
      .single(),
    supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('recipe_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('cooked', true),
    supabase
      .from('recipe_feedback')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('cooked', true)
      .order('created_at', { ascending: false }),
  ])

  const profile = profileRes.data
  const stats = {
    saved:  savedRes.count  ?? 0,
    cooked: cookedRes.count ?? 0,
    streak: calcStreak(datesRes.data ?? []),
  }

  return (
    <AccountClient
      profile={profile}
      email={user.email ?? ''}
      stats={stats}
    />
  )
}
