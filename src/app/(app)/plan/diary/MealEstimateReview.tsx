'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics/client'
import { inferMealType, loggedAtForDate, todayISODate } from './utils'
import MealItemsEditor, { sumItems } from './MealItemsEditor'
import type { Json } from '@/types/database.types'
import type { MealEstimate, MealItem, MealLog, MealType } from './types'

interface Props {
  userId: string
  estimate: MealEstimate
  source: 'manual' | 'photo'
  loggedAtDate: string
  onConfirm: (log: MealLog) => void
  onCancel: () => void
}

function diffFromEstimate(original: MealItem[], edited: MealItem[]) {
  const itemsAdded = Math.max(0, edited.length - original.length)
  const itemsRemoved = Math.max(0, original.length - edited.length)
  const overlap = Math.min(original.length, edited.length)
  let itemsChanged = 0
  for (let i = 0; i < overlap; i++) {
    const o = original[i]!
    const e = edited[i]!
    if (
      o.name !== e.name || o.quantity !== e.quantity || o.calories !== e.calories ||
      o.protein_g !== e.protein_g || o.carbs_g !== e.carbs_g || o.fat_g !== e.fat_g
    ) {
      itemsChanged++
    }
  }
  return { itemsAdded, itemsRemoved, itemsChanged, edited: itemsAdded > 0 || itemsRemoved > 0 || itemsChanged > 0 }
}

export default function MealEstimateReview({ userId, estimate, source, loggedAtDate, onConfirm, onCancel }: Props) {
  const t = useTranslations('diary')
  const [items, setItems] = useState<MealItem[]>(estimate.items)
  const [mealType, setMealType] = useState<MealType>(loggedAtDate === todayISODate() ? inferMealType() : 'breakfast')
  const [saving, setSaving] = useState(false)

  const total = sumItems(items)

  const handleConfirm = async () => {
    setSaving(true)
    const diff = diffFromEstimate(estimate.items, items)
    void trackEvent('meal_estimate_reviewed', {
      source,
      confidence: estimate.confidence,
      ...diff,
    })
    const supabase = createClient()
    const { data, error } = await supabase
      .from('meal_logs')
      .insert({
        user_id: userId,
        logged_at: loggedAtForDate(loggedAtDate),
        meal_type: mealType,
        name: estimate.summary || items[0]?.name || 'Meal',
        calories: Math.round(total.calories),
        protein_g: total.protein_g,
        carbs_g: total.carbs_g,
        fat_g: total.fat_g,
        source,
        items: items as unknown as Json,
      })
      .select('*')
      .single()
    setSaving(false)
    if (!error && data) onConfirm(data as MealLog)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 110,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 430, maxHeight: '88vh', overflowY: 'auto',
        background: 'var(--bg)', borderRadius: '20px 20px 0 0',
        padding: '20px 20px calc(20px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div className="serif" style={{ fontSize: 20, fontWeight: 400, color: 'var(--text)' }}>
            {t('review_title')}
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 16, color: 'var(--muted)', cursor: 'pointer', padding: 4 }}>✕</button>
        </div>
        <div style={{ fontSize: 10.5, color: 'var(--muted)', marginBottom: 12 }}>
          {t('review_subtitle')}
        </div>
        {estimate.confidence === 'low' && (
          <div style={{
            background: 'var(--warn-bg)', borderRadius: 'var(--r-xs)', padding: '10px 14px',
            marginBottom: 12, fontSize: 11, color: 'var(--accent)', fontFamily: 'Epilogue, sans-serif',
          }}>
            {t('low_confidence_warning')}
          </div>
        )}
        {estimate.notes && (
          <div style={{ fontSize: 10.5, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 12 }}>{estimate.notes}</div>
        )}

        <MealItemsEditor
          items={items}
          onItemsChange={setItems}
          mealType={mealType}
          onMealTypeChange={setMealType}
        />

        <button className="btn-dark" onClick={() => void handleConfirm()} disabled={saving || items.length === 0}>
          {saving ? '…' : t('confirm_log')}
        </button>
      </div>
    </div>
  )
}
