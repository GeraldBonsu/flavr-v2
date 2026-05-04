'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics/client'

interface Props {
  recipeId: string
  mode: 'rating' | 'cooked'
  onClose: () => void
}

export default function FeedbackModal({ recipeId, mode, onClose }: Props) {
  const [rating, setRating]   = useState<1 | 2 | null>(null)
  const [cooked, setCooked]   = useState<boolean | null>(null)
  const [notes, setNotes]     = useState('')
  const [saving, setSaving]   = useState(false)

  const handleSubmit = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { onClose(); return }

    // Upsert — if row exists update it, else insert
    const payload: {
      user_id: string
      recipe_id: string
      rating?: 1 | 2 | null
      cooked?: boolean | null
      notes?: string | null
    } = { user_id: user.id, recipe_id: recipeId }

    if (mode === 'rating' && rating !== null) payload.rating = rating
    if (mode === 'cooked' && cooked !== null) payload.cooked = cooked
    if (notes.trim()) payload.notes = notes.trim()

    const { data: existing } = await supabase
      .from('recipe_feedback')
      .select('id')
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)
      .single()

    if (existing?.id) {
      await supabase.from('recipe_feedback').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('recipe_feedback').insert(payload)
    }

    if (mode === 'rating') void trackEvent('recipe_feedback_submitted', { rating })
    setSaving(false)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
    }}>
      <div style={{
        width: '100%', maxWidth: 430,
        background: '#fff', borderRadius: '20px 20px 0 0',
        padding: '24px 20px 36px',
      }}>
        <div className="serif" style={{ fontSize: 18, fontWeight: 400, color: 'var(--text)', marginBottom: 4 }}>
          {mode === 'rating' ? 'How was this recipe?' : 'Did you cook this?'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 20 }}>
          {mode === 'rating' ? 'Your feedback helps us suggest better recipes' : 'Let us know how it went'}
        </div>

        {mode === 'rating' && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {[
              { val: 2 as const, label: '👍 Loved it' },
              { val: 1 as const, label: '👎 Not for me' },
            ].map(b => (
              <button key={b.val} onClick={() => setRating(b.val)} style={{
                flex: 1, padding: '12px', borderRadius: 12,
                border: rating === b.val ? '1.5px solid var(--green)' : '0.5px solid rgba(0,0,0,0.12)',
                background: rating === b.val ? 'var(--tag-bg)' : '#fff',
                fontSize: 13, cursor: 'pointer', fontFamily: 'Epilogue, sans-serif',
              }}>
                {b.label}
              </button>
            ))}
          </div>
        )}

        {mode === 'cooked' && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {[
              { val: true,  label: '✅ Yes, I did!' },
              { val: false, label: '⏳ Not yet' },
            ].map(b => (
              <button key={String(b.val)} onClick={() => setCooked(b.val)} style={{
                flex: 1, padding: '12px', borderRadius: 12,
                border: cooked === b.val ? '1.5px solid var(--green)' : '0.5px solid rgba(0,0,0,0.12)',
                background: cooked === b.val ? 'var(--tag-bg)' : '#fff',
                fontSize: 13, cursor: 'pointer', fontFamily: 'Epilogue, sans-serif',
              }}>
                {b.label}
              </button>
            ))}
          </div>
        )}

        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any notes? (optional)"
          rows={2}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 10,
            border: '0.5px solid rgba(0,0,0,0.12)', background: '#fff',
            fontSize: 12, fontFamily: 'Epilogue, sans-serif', color: 'var(--text)',
            outline: 'none', resize: 'none', marginBottom: 16,
          }}
        />

        <button
          className="btn-dark"
          onClick={handleSubmit}
          disabled={saving || (mode === 'rating' && rating === null) || (mode === 'cooked' && cooked === null)}
        >
          {saving ? 'Saving…' : 'Submit feedback'}
        </button>

        <button
          onClick={onClose}
          style={{ display: 'block', width: '100%', marginTop: 10, background: 'none', border: 'none', fontSize: 11, color: 'var(--muted)', cursor: 'pointer', fontFamily: 'Epilogue, sans-serif' }}
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
