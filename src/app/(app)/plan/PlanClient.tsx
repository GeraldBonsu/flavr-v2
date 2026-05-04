'use client'

import { useState } from 'react'
import AppHeader from '@/components/app/AppHeader'
import BottomNav from '@/components/app/BottomNav'
import { ToastProvider, useToast } from '@/components/app/Toast'

interface MealDay {
  day: string
  meals: Array<{ type: string; label: string; name: string; kcal: number }>
}
interface MealPlan {
  avgKcal: number; avgProtein: string; totalMeals: number; days: MealDay[]
}

function PlanInner({ profile }: { profile: { goal?: string | null; dietary_restrictions?: string[] | null } | null }) {
  const { showToast } = useToast()
  const [plan, setPlan]       = useState<MealPlan | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateMealPlan',
          goal: profile?.goal ?? 'balanced',
          diet: profile?.dietary_restrictions ?? [],
        }),
      })
      const data = await res.json() as MealPlan
      setPlan(data)
    } catch {
      showToast('Could not generate plan — try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <AppHeader />

      <div className="content-scroll" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="serif" style={{ fontSize: 18, fontWeight: 400, color: 'var(--text)' }}>7-Day meal plan</div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>A personalised weekly plan based on your goal</div>

        {!plan && (
          <button className="btn-dark" onClick={generate} disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Generating…' : 'Generate my plan →'}
          </button>
        )}

        {plan && (
          <>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { val: `${plan.avgKcal} kcal`, lbl: 'avg / day' },
                { val: plan.avgProtein, lbl: 'avg protein' },
                { val: String(plan.totalMeals), lbl: 'total meals' },
              ].map(m => (
                <div key={m.lbl} style={{ flex: 1, background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600, color: 'var(--accent)' }}>{m.val}</div>
                  <div style={{ fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-light)', marginTop: 2 }}>{m.lbl}</div>
                </div>
              ))}
            </div>

            {plan.days.map(day => (
              <div key={day.day} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 11, padding: '12px 14px' }}>
                <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-light)', marginBottom: 8 }}>{day.day}</div>
                {day.meals.map(meal => (
                  <div key={meal.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '0.5px solid rgba(0,0,0,0.05)' }}>
                    <div>
                      <div style={{ fontSize: 8, color: 'var(--muted-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{meal.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--text)', marginTop: 1 }}>{meal.name}</div>
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 500 }}>{meal.kcal} kcal</div>
                  </div>
                ))}
              </div>
            ))}

            <button onClick={generate} disabled={loading} style={{ padding: '10px', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.12)', background: '#fff', fontSize: 11, color: 'var(--muted)', cursor: 'pointer', fontFamily: 'Epilogue, sans-serif' }}>
              {loading ? 'Regenerating…' : 'Regenerate plan'}
            </button>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

export default function PlanClient({ profile }: { profile: { goal?: string | null; dietary_restrictions?: string[] | null } | null }) {
  return (
    <ToastProvider>
      <PlanInner profile={profile} />
    </ToastProvider>
  )
}
