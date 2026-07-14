'use client'

import { useTranslations } from 'next-intl'
import type { MealItem, MealType } from './types'

interface Props {
  items: MealItem[]
  onItemsChange: (items: MealItem[]) => void
  mealType: MealType
  onMealTypeChange: (mealType: MealType) => void
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export function sumItems(items: MealItem[]) {
  return items.reduce((acc, item) => ({
    calories: acc.calories + item.calories,
    protein_g: acc.protein_g + item.protein_g,
    carbs_g: acc.carbs_g + item.carbs_g,
    fat_g: acc.fat_g + item.fat_g,
  }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 })
}

export default function MealItemsEditor({ items, onItemsChange, mealType, onMealTypeChange }: Props) {
  const t = useTranslations('diary')
  const total = sumItems(items)

  const updateItem = (index: number, field: keyof MealItem, value: string) => {
    onItemsChange(items.map((item, i) => {
      if (i !== index) return item
      if (field === 'name' || field === 'quantity') return { ...item, [field]: value }
      const num = parseFloat(value)
      return { ...item, [field]: Number.isFinite(num) ? num : 0 }
    }))
  }

  const removeItem = (index: number) => onItemsChange(items.filter((_, i) => i !== index))
  const addItem = () => onItemsChange([...items, { name: '', quantity: '', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }])

  return (
    <>
      {/* Meal type picker */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {MEAL_TYPES.map(mt => (
          <button key={mt} onClick={() => onMealTypeChange(mt)} style={{
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

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <input
                value={item.name} onChange={e => updateItem(i, 'name', e.target.value)}
                placeholder={t('item_name_placeholder')}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 12, fontWeight: 500, color: 'var(--text)', fontFamily: 'Epilogue, sans-serif' }}
              />
              <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 13, fontWeight: 700, padding: 0 }}>×</button>
            </div>
            <input
              value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)}
              placeholder={t('quantity_label')}
              style={{ width: '100%', border: 'none', outline: 'none', fontSize: 10, color: 'var(--muted)', fontFamily: 'Epilogue, sans-serif', marginBottom: 8 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {([
                { field: 'calories' as const, label: 'kcal' },
                { field: 'protein_g' as const, label: 'P g' },
                { field: 'carbs_g' as const, label: 'C g' },
                { field: 'fat_g' as const, label: 'F g' },
              ]).map(f => (
                <div key={f.field}>
                  <div style={{ fontSize: 8, color: 'var(--muted-light)', textTransform: 'uppercase', marginBottom: 2 }}>{f.label}</div>
                  <input
                    type="number" value={item[f.field]} onChange={e => updateItem(i, f.field, e.target.value)}
                    style={{
                      width: '100%', padding: '5px 6px', borderRadius: 6,
                      border: '0.5px solid rgba(0,0,0,0.1)', fontSize: 11,
                      fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)', outline: 'none',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={addItem} style={{
        width: '100%', padding: '8px', borderRadius: 8, marginBottom: 14,
        border: '0.5px dashed rgba(0,0,0,0.2)', background: 'none',
        fontSize: 10.5, color: 'var(--muted)', cursor: 'pointer', fontFamily: 'Epilogue, sans-serif',
      }}>
        {t('add_item')}
      </button>

      {/* Total */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { val: `${Math.round(total.calories)}`, lbl: 'kcal' },
          { val: `${Math.round(total.protein_g)}g`, lbl: t('protein') },
          { val: `${Math.round(total.carbs_g)}g`, lbl: t('carbs') },
          { val: `${Math.round(total.fat_g)}g`, lbl: t('fat') },
        ].map(m => (
          <div key={m.lbl} style={{ flex: 1, background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: '8px 6px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>{m.val}</div>
            <div style={{ fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-light)', marginTop: 2 }}>{m.lbl}</div>
          </div>
        ))}
      </div>
    </>
  )
}
