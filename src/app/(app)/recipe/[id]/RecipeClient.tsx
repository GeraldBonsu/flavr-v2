'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import FeedbackModal from '@/components/app/FeedbackModal'
import { ToastProvider, useToast } from '@/components/app/Toast'
import { trackEvent } from '@/lib/analytics/client'
import type { Database } from '@/types/database.types'

type Recipe = Database['public']['Tables']['recipes']['Row']
type Feedback = { id: string; rating: number | null; cooked: boolean | null } | null

interface Ingredient { item: string; amount: string; extra: boolean; kcal?: number }

function RecipeInner({ recipe, existingFeedback }: { recipe: Recipe; existingFeedback: Feedback }) {
  const router = useRouter()
  const { showToast } = useToast()
  const t = useTranslations('recipe')

  const searchParams = useSearchParams()
  const [feedback, setFeedback] = useState<Feedback>(existingFeedback)
  const [modalMode, setModalMode] = useState<'rating' | 'cooked' | null>(null)
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggleItem = (i: number) =>
    setCheckedItems(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s })
  const allChecked = checkedItems.size === ingredients.length && ingredients.length > 0

  const handleGenerateAnother = () => {
    const items = ingredients.map(ing => ing.item).join(',')
    const params = new URLSearchParams({ ingredients: items, goal: recipe.goal ?? 'balanced' })
    router.push(`/generating?${params.toString()}`)
  }

  useEffect(() => {
    void trackEvent('recipe_saved', { recipe_id: recipe.id })

    if (!existingFeedback?.rating) {
      if (searchParams.get('from') === 'cook') {
        // Returned from cooking journey — show feedback immediately
        setModalMode('rating')
      } else {
        // Show after 5 minutes of idle reading
        timerRef.current = setTimeout(() => setModalMode('rating'), 300_000)
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ingredients = (recipe.ingredients as unknown as Ingredient[]) ?? []
  const steps = recipe.steps ?? []

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      {/* Hero */}
      <div style={{ background: '#2D1A0E', padding: '14px 18px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 20, padding: '4px 12px', fontSize: 9, color: 'rgba(255,255,255,0.7)', fontFamily: 'Epilogue, sans-serif', cursor: 'pointer' }}>
            {t('back')}
          </button>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em' }}>{t('label')}</span>
          <div style={{ width: 52 }} />
        </div>
        <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 5 }}>
          {recipe.cuisine} · {recipe.goal}
        </div>
        <div className="serif" style={{ fontSize: 20, fontWeight: 400, color: '#fff', lineHeight: 1.2, marginBottom: 10 }}>
          {recipe.emoji} {recipe.name}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[`⏱ ${recipe.cook_time ?? ''}`, `👤 ${t('servings', { n: recipe.servings ?? '' })}`, `🔥 ${t('difficulty')}`].map(chip => (
            <span key={chip} style={{ fontSize: 8, color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.1)', padding: '3px 9px', borderRadius: 20 }}>
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* Macros */}
      <div className="macro-strip">
        {[
          { val: recipe.calories?.toString() ?? '—', lbl: t('kcal'), cal: true },
          { val: recipe.protein ?? '—', lbl: t('protein'), cal: false },
          { val: recipe.carbs ?? '—', lbl: t('carbs'), cal: false },
          { val: recipe.fats ?? '—', lbl: t('fats'), cal: false },
        ].map(m => (
          <div key={m.lbl} className="macro-cell">
            <div className={`macro-num ${m.cal ? 'cal' : ''}`}>{m.val}</div>
            <div className="macro-lbl">{m.lbl}</div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="content-scroll" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div className="sec-title">{t('ingredients_title')}</div>
          {ingredients.map((ing, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '0.5px solid rgba(0,0,0,0.05)' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: 'var(--text)', flex: 1 }}>{ing.item}</span>
              <span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 500 }}>{ing.amount}</span>
              {ing.extra && <span style={{ fontSize: 8, color: 'var(--muted-light)', fontStyle: 'italic' }}>{t('suggested')}</span>}
              {ing.kcal != null && <span style={{ fontSize: 8.5, color: 'var(--accent-soft)', fontWeight: 500, fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>{ing.kcal} {t('kcal')}</span>}
            </div>
          ))}
        </div>

        <div>
          <div className="sec-title">{t('method_title')}</div>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '0.5px solid rgba(0,0,0,0.05)' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--green)', color: '#fff', fontSize: 8, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 10, color: 'var(--text)', lineHeight: 1.6, flex: 1 }}>{step}</span>
            </div>
          ))}
        </div>

        {/* Shopping list */}
        <div>
          <div className="sec-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {t('whats_needed')}
            {allChecked && <span style={{ fontSize: 9, color: 'var(--green)', fontWeight: 600 }}>✓ {t('all_set')}</span>}
          </div>
          {ingredients.map((ing, i) => (
            <div
              key={i}
              onClick={() => toggleItem(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
                borderBottom: '0.5px solid rgba(0,0,0,0.05)', cursor: 'pointer',
                opacity: checkedItems.has(i) ? 0.4 : 1,
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                border: checkedItems.has(i) ? 'none' : '1.5px solid rgba(0,0,0,0.18)',
                background: checkedItems.has(i) ? 'var(--green)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {checkedItems.has(i) && <span style={{ color: '#fff', fontSize: 9, lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{ fontSize: 10, color: 'var(--text)', flex: 1, textDecoration: checkedItems.has(i) ? 'line-through' : 'none' }}>{ing.item}</span>
              <span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 500 }}>{ing.amount}</span>
            </div>
          ))}
        </div>

        {recipe.goal_note && (
          <div style={{ background: 'var(--tag-bg)', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 8, fontWeight: 600, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
              {t('goal_for', { goal: recipe.goal ?? '' })}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text)', lineHeight: 1.6 }}>{recipe.goal_note}</div>
          </div>
        )}

        {/* Feedback thumbs */}
        {feedback?.rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#fff', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)' }}>
            <span style={{ fontSize: 20 }}>{feedback.rating === 2 ? '👍' : '👎'}</span>
            <span style={{ fontSize: 10, color: 'var(--muted)' }}>{t('rated')}</span>
          </div>
        )}
        {!feedback?.rating && (
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ val: 2 as const, label: t('loved_it') }, { val: 1 as const, label: t('not_for_me') }].map(b => (
              <button key={b.val} onClick={() => setModalMode('rating')} style={{
                flex: 1, padding: '10px', borderRadius: 10,
                border: '0.5px solid rgba(0,0,0,0.1)', background: '#fff',
                fontSize: 10, cursor: 'pointer', fontFamily: 'Epilogue, sans-serif', color: 'var(--muted)',
              }}>
                {b.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '10px 16px 20px', borderTop: '0.5px solid var(--border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link href={`/recipe/${recipe.id}/cook`} style={{
          display: 'block', width: '100%', padding: '14px',
          background: 'var(--text)', color: '#fff',
          borderRadius: 'var(--r-pill)', fontSize: 14, fontWeight: 500,
          fontFamily: 'Epilogue, sans-serif', textAlign: 'center', textDecoration: 'none',
        }}>
          {t('start_cooking')}
        </Link>
        <button onClick={handleGenerateAnother} style={{
          display: 'block', width: '100%', padding: '13px',
          background: 'none', color: 'var(--text)',
          border: '0.5px solid var(--border)',
          borderRadius: 'var(--r-pill)', fontSize: 13, fontWeight: 500,
          fontFamily: 'Epilogue, sans-serif', cursor: 'pointer',
        }}>
          {t('generate_another')}
        </button>
        <Link href="/home" style={{
          display: 'block', textAlign: 'center', fontSize: 11,
          color: 'var(--muted)', fontFamily: 'Epilogue, sans-serif',
          textDecoration: 'none', padding: '2px 0',
        }}>
          {t('change_ingredients')}
        </Link>
      </div>

      {modalMode && (
        <FeedbackModal
          recipeId={recipe.id}
          mode={modalMode}
          onClose={() => {
            setModalMode(null)
            setFeedback(prev => ({
              ...prev,
              id: prev?.id ?? '',
              rating: modalMode === 'rating' ? (feedback?.rating ?? null) : (prev?.rating ?? null),
              cooked: modalMode === 'cooked' ? true : (prev?.cooked ?? null),
            }))
          }}
        />
      )}
    </div>
  )
}

export default function RecipeClient({ recipe, existingFeedback }: { recipe: Recipe; existingFeedback: Feedback }) {
  return (
    <ToastProvider>
      <RecipeInner recipe={recipe} existingFeedback={existingFeedback} />
    </ToastProvider>
  )
}
