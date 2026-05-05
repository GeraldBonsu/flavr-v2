'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import AppHeader from '@/components/app/AppHeader'
import BottomNav from '@/components/app/BottomNav'
import { createClient } from '@/lib/supabase/client'

type Category = 'fridge' | 'cupboard' | 'spices'

interface PantryItem {
  id: string
  ingredient: string
  category: string
  added_at: string
}

interface Props {
  userId: string
  initialItems: PantryItem[]
}

const SPICE_KEYWORDS = ['cumin', 'paprika', 'turmeric', 'coriander', 'chilli', 'chili', 'pepper', 'salt', 'cinnamon', 'ginger', 'cardamom', 'clove', 'oregano', 'thyme', 'rosemary', 'basil', 'bay', 'nutmeg', 'cayenne', 'saffron', 'vanilla', 'allspice', 'fennel', 'mustard seed', 'fenugreek']
const FRIDGE_KEYWORDS = ['egg', 'milk', 'butter', 'cheese', 'yogurt', 'yoghurt', 'cream', 'halloumi', 'feta', 'tofu', 'spinach', 'kale', 'lettuce', 'tomato', 'carrot', 'celery', 'broccoli', 'cauliflower', 'courgette', 'zucchini', 'aubergine', 'eggplant', 'cucumber', 'bell pepper', 'mushroom', 'leek', 'spring onion', 'lime', 'lemon', 'orange', 'apple', 'berry', 'berries', 'meat', 'chicken', 'beef', 'pork', 'fish', 'salmon', 'prawns', 'shrimp', 'bacon', 'ham', 'sausage']

function inferCategory(ingredient: string): Category {
  const lower = ingredient.toLowerCase()
  if (SPICE_KEYWORDS.some(k => lower.includes(k))) return 'spices'
  if (FRIDGE_KEYWORDS.some(k => lower.includes(k))) return 'fridge'
  return 'cupboard'
}

function daysOld(added_at: string): number {
  return Math.floor((Date.now() - new Date(added_at).getTime()) / 86400000)
}

export default function PantryClient({ userId, initialItems }: Props) {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('pantry')

  const CATEGORY_LABELS: Record<Category, string> = {
    fridge: t('fridge'),
    cupboard: t('cupboard'),
    spices: t('spices'),
  }

  const [items, setItems] = useState<PantryItem[]>(initialItems)
  const [inputVal, setInputVal] = useState('')
  const [addCategory, setAddCategory] = useState<Category>('fridge')
  const [editMode, setEditMode] = useState<Category | null>(null)
  const [scanning, setScanning] = useState(false)

  const grouped = (['fridge', 'cupboard', 'spices'] as Category[]).map(cat => ({
    cat,
    items: items.filter(i => i.category === cat),
  }))

  const totalCount = items.length
  const staleItems = items.filter(i => i.category === 'fridge' && daysOld(i.added_at) >= 3)

  async function addItem(name: string, cat: Category) {
    const trimmed = name.trim()
    if (!trimmed || trimmed.length < 2) return
    const tempId = `temp-${Date.now()}`
    const optimistic: PantryItem = { id: tempId, ingredient: trimmed, category: cat, added_at: new Date().toISOString() }
    setItems(prev => [optimistic, ...prev])
    const { data, error } = await supabase
      .from('pantry_items')
      .insert({ user_id: userId, ingredient: trimmed, category: cat })
      .select('id, ingredient, category, added_at')
      .single()
    if (error || !data) {
      setItems(prev => prev.filter(i => i.id !== tempId))
    } else {
      setItems(prev => prev.map(i => i.id === tempId ? data : i))
    }
  }

  async function deleteItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('pantry_items').delete().eq('id', id)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const name = inputVal.replace(/,$/, '').trim()
      if (name) {
        void addItem(name, addCategory)
        setInputVal('')
      }
    }
  }

  async function handleScan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1] ?? ''
        const mediaType = file.type
        const res = await fetch('/api/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'analyzeImage', base64, mediaType }),
        })
        const data = await res.json() as { ingredients?: string[] }
        if (data.ingredients) {
          for (const ing of data.ingredients) {
            await addItem(ing, inferCategory(ing))
          }
        }
        setScanning(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setScanning(false)
    }
  }

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <AppHeader />

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: 'var(--text)', margin: 0 }}>
              {t('title')}
            </h1>
            <p style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', margin: '3px 0 0', fontFamily: 'Epilogue, sans-serif' }}>
              {t('subtitle')}
            </p>
          </div>
          <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Epilogue, sans-serif' }}>
            {totalCount} item{totalCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Add bar */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('add_placeholder')}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 'var(--r-pill)',
              border: '0.5px solid var(--border)', background: '#fff',
              fontSize: 13, fontFamily: 'Epilogue, sans-serif', color: 'var(--text)',
              outline: 'none',
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={scanning}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: scanning ? 'var(--border)' : 'var(--tag-bg)',
              border: '0.5px solid var(--border)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, flexShrink: 0,
            }}
            title="Scan ingredients from photo"
          >
            {scanning ? '…' : '📷'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleScan} />
        </div>

        {/* Category toggle for new items */}
        <div style={{ display: 'flex', gap: 6 }}>
          {(['fridge', 'cupboard', 'spices'] as Category[]).map(cat => (
            <button
              key={cat}
              onClick={() => setAddCategory(cat)}
              style={{
                padding: '5px 12px', borderRadius: 'var(--r-pill)', fontSize: 11,
                fontFamily: 'Epilogue, sans-serif', fontWeight: 500,
                cursor: 'pointer', border: 'none',
                background: addCategory === cat ? 'var(--green)' : 'var(--tag-bg)',
                color: addCategory === cat ? '#fff' : 'var(--green)',
              }}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Grouped sections */}
        {grouped.map(({ cat, items: groupItems }) => (
          <div key={cat}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontFamily: 'Epilogue, sans-serif' }}>
                {CATEGORY_LABELS[cat]} · {groupItems.length}
              </span>
              {groupItems.length > 0 && (
                <button
                  onClick={() => setEditMode(editMode === cat ? null : cat)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: 'var(--accent)', fontFamily: 'Epilogue, sans-serif', fontWeight: 500, padding: 0 }}
                >
                  {editMode === cat ? t('done') : t('edit')}
                </button>
              )}
            </div>

            {groupItems.length === 0 ? (
              <p style={{ fontSize: 11, color: 'var(--muted-light)', fontStyle: 'italic', fontFamily: 'Epilogue, sans-serif', margin: 0 }}>
                {t('nothing_here')}
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {groupItems.map(item => (
                  <span
                    key={item.id}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '5px 12px', borderRadius: 'var(--r-pill)',
                      border: '1px solid var(--green)', background: 'var(--tag-bg)',
                      color: 'var(--green)', fontSize: 11, fontFamily: 'Epilogue, sans-serif',
                      fontWeight: 500,
                    }}
                  >
                    {item.ingredient}
                    {editMode === cat && (
                      <button
                        onClick={() => void deleteItem(item.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 12, lineHeight: 1, padding: 0, marginLeft: 2, fontWeight: 700 }}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Use it up banners */}
        {staleItems.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {staleItems.slice(0, 3).map(item => (
              <div
                key={item.id}
                style={{ background: 'var(--warn-bg)', borderRadius: 'var(--r-xs)', padding: '10px 14px' }}
              >
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', fontFamily: 'Epilogue, sans-serif', marginBottom: 3 }}>
                  {t('use_it_up')}
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--text)', fontFamily: 'Epilogue, sans-serif' }}>
                  {t('days_old', { ingredient: item.ingredient, days: daysOld(item.added_at) })}{' '}
                  <Link
                    href={`/home?pantry=${encodeURIComponent(item.ingredient)}`}
                    style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    {t('recipe_ideas')}
                  </Link>
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  )
}
