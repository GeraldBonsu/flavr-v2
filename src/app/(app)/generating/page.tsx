'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics/client'

function GeneratingInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const hasRun       = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true
    const ingredients = searchParams.get('ingredients')?.split(',').filter(Boolean) ?? []
    const goal        = searchParams.get('goal') ?? 'balanced'
    const diet        = searchParams.get('diet')?.split(',').filter(Boolean) ?? []

    if (ingredients.length < 2) { router.replace('/home'); return }

    async function run() {
      try {
        const res = await fetch('/api/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'generateRecipe', ingredients, goal, diet }),
        })

        if (res.status === 401) { router.replace('/login'); return }
        const recipe = await res.json() as Record<string, unknown>

        // Persist to Supabase
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase.from('recipes').insert({
            user_id:     user.id,
            name:        recipe['name'] as string,
            emoji:       recipe['emoji'] as string,
            cuisine:     recipe['cuisine'] as string,
            cook_time:   recipe['cookTime'] as string,
            servings:    recipe['servings'] as number,
            calories:    recipe['calories'] as number,
            protein:     recipe['protein'] as string,
            carbs:       recipe['carbs'] as string,
            fats:        recipe['fats'] as string,
            ingredients: recipe['ingredients'] as import('@/types/database.types').Json,
            steps:       recipe['steps'] as string[],
            goal_note:   recipe['goalNote'] as string,
            goal,
          }).select('id').single()

          if (data?.id) {
            void trackEvent('recipe_generated', { goal, restrictions: diet })
            router.replace(`/recipe/${data.id}`)
            return
          }
        }
        router.replace('/home')
      } catch {
        router.replace('/home')
      }
    }

    void run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="screen" style={{ background: '#1A3A0A', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 30, fontWeight: 600, color: '#B84A1E', letterSpacing: '-0.02em', marginBottom: 20 }}>
        flavr<span style={{ color: '#6BCB8B' }}>.</span>
      </div>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'splash-spin 0.9s linear infinite' }}>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
      <div style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'Epilogue, sans-serif' }}>
        Generating your recipe…
      </div>
    </div>
  )
}

export default function GeneratingPage() {
  return (
    <Suspense>
      <GeneratingInner />
    </Suspense>
  )
}
