'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { parseGrams } from '@/lib/nutrition/parseGrams'
import { inferMealType } from './utils'
import type { Json } from '@/types/database.types'
import type { MealLog, MealType } from './types'

interface Props {
  userId: string
  onLogged: (log: MealLog) => void
  onClose: () => void
}

interface SavedRecipe {
  id: string
  name: string
  emoji: string | null
  calories: number | null
  protein: string | null
  carbs: string | null
  fats: string | null
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export default function RecipePickerFlow({ userId, onLogged, onClose }: Props) {
  const t = useTranslations('diary')
  const [recipes, setRecipes] = useState<SavedRecipe[] | null>(null)
  const [selected, setSelected] = useState<SavedRecipe | null>(null)
  const [mealType, setMealType] = useState<MealType>(inferMealType())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('recipes')
      .select('id, name, emoji, calories, protein, carbs, fats')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })
      .then(({ data }) => setRecipes(data ?? []))
  }, [userId])

  const handleLog = async () => {
    if (!selected) return
    setSaving(true)
    const calories = selected.calories ?? 0
    const protein_g = parseGrams(selected.protein)
    const carbs_g = parseGrams(selected.carbs)
    const fat_g = parseGrams(selected.fats)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('meal_logs')
      .insert({
        user_id: userId,
        meal_type: mealType,
        name: selected.name,
        calories,
        protein_g,
        carbs_g,
        fat_g,
        source: 'recipe',
        recipe_id: selected.id,
        items: [{ name: selected.name, quantity: '1 serving', calories, protein_g, carbs_g, fat_g }] as unknown as Json,
      })
      .select('*')
      .single()
    setSaving(false)
    if (!error && data) onLogged(data as MealLog)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 110,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 430, maxHeight: '82vh', overflowY: 'auto',
        background: 'var(--bg)', borderRadius: '20px 20px 0 0',
        padding: '20px 20px calc(20px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div className="serif" style={{ fontSize: 20, fontWeight: 400, color: 'var(--text)' }}>
            {t('from_saved_recipe')}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 16, color: 'var(--muted)', cursor: 'pointer', padding: 4 }}>✕</button>
        </div>

        {recipes === null && (
          <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>…</div>
        )}
        {recipes?.length === 0 && (
          <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>{t('no_saved_recipes')}</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {recipes?.map(r => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                padding: '10px 12px', borderRadius: 10,
                border: selected?.id === r.id ? '1.5px solid var(--green)' : '0.5px solid rgba(0,0,0,0.08)',
                background: selected?.id === r.id ? 'var(--tag-bg)' : '#fff',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 18 }}>{r.emoji ?? '🍽️'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text)', fontFamily: 'Epilogue, sans-serif' }}>{r.name}</div>
                <div style={{ fontSize: 9.5, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {r.calories ?? 0} kcal · {r.protein ?? '0g'} P
                </div>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {MEAL_TYPES.map(mt => (
                <button key={mt} onClick={() => setMealType(mt)} style={{
                  flex: 1, padding: '7px 4px', borderRadius: 10,
                  border: mealType === mt ? '1px solid var(--green)' : '0.5px solid rgba(0,0,0,0.1)',
                  background: mealType === mt ? 'var(--tag-bg)' : '#fff',
                  fontSize: 9.5, fontWeight: 500,
                  color: mealType === mt ? 'var(--green)' : 'var(--muted)',
                  cursor: 'pointer', fontFamily: 'Epilogue, sans-serif',
                }}>
                  {t(mt)}
                </button>
              ))}
            </div>
            <button className="btn-dark" onClick={() => void handleLog()} disabled={saving}>
              {saving ? '…' : t('confirm_log')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
