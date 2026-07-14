'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import MealItemsEditor, { sumItems } from './MealItemsEditor'
import type { Json } from '@/types/database.types'
import type { MealItem, MealLog, MealType } from './types'

interface Props {
  existingLog: MealLog
  onSaved: (log: MealLog) => void
  onCancel: () => void
}

export default function EditMealLogModal({ existingLog, onSaved, onCancel }: Props) {
  const t = useTranslations('diary')
  const [items, setItems] = useState<MealItem[]>(existingLog.items ?? [])
  const [mealType, setMealType] = useState<MealType>(existingLog.meal_type)
  const [saving, setSaving] = useState(false)

  const total = sumItems(items)

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('meal_logs')
      .update({
        meal_type: mealType,
        calories: Math.round(total.calories),
        protein_g: total.protein_g,
        carbs_g: total.carbs_g,
        fat_g: total.fat_g,
        items: items as unknown as Json,
      })
      .eq('id', existingLog.id)
      .select('*')
      .single()
    setSaving(false)
    if (!error && data) onSaved(data as MealLog)
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div className="serif" style={{ fontSize: 20, fontWeight: 400, color: 'var(--text)' }}>
            {t('edit_meal_title')}
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 16, color: 'var(--muted)', cursor: 'pointer', padding: 4 }}>✕</button>
        </div>

        <MealItemsEditor
          items={items}
          onItemsChange={setItems}
          mealType={mealType}
          onMealTypeChange={setMealType}
        />

        <button className="btn-dark" onClick={() => void handleSave()} disabled={saving || items.length === 0}>
          {saving ? '…' : t('save_changes')}
        </button>
      </div>
    </div>
  )
}
