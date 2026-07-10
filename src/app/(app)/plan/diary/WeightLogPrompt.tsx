'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  onLogged: () => void
}

export default function WeightLogPrompt({ userId, onLogged }: Props) {
  const t = useTranslations('diary')
  const [weight, setWeight] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const handleSave = async () => {
    const weightNum = parseFloat(weight)
    if (!weightNum || weightNum <= 0) return
    setSaving(true)
    const supabase = createClient()
    const todayIso = new Date().toISOString().slice(0, 10)
    await supabase.from('weight_logs').upsert(
      { user_id: userId, logged_at: todayIso, weight_kg: weightNum },
      { onConflict: 'user_id,logged_at' }
    )
    setSaving(false)
    setDone(true)
    onLogged()
  }

  if (done) {
    return (
      <div style={{ background: 'var(--tag-bg)', borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: 11, color: 'var(--green)', fontFamily: 'Epilogue, sans-serif' }}>
        ✓ {t('weight_logged')}
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 'var(--r-sm)', padding: '12px 14px' }}>
      <div style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--text)', marginBottom: 8, fontFamily: 'Epilogue, sans-serif' }}>
        {t('weight_prompt_title')}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="number" value={weight} onChange={e => setWeight(e.target.value)}
          placeholder={t('weight_placeholder')}
          style={{
            flex: 1, padding: '9px 12px', borderRadius: 8,
            border: '0.5px solid rgba(0,0,0,0.12)', background: '#fff',
            fontSize: 12, fontFamily: 'Epilogue, sans-serif', color: 'var(--text)', outline: 'none',
          }}
        />
        <button
          onClick={() => void handleSave()}
          disabled={!weight || saving}
          style={{
            padding: '9px 16px', borderRadius: 8, background: 'var(--green)', color: '#fff',
            border: 'none', fontSize: 10, fontWeight: 500, fontFamily: 'Epilogue, sans-serif',
            cursor: saving ? 'not-allowed' : 'pointer', opacity: (!weight || saving) ? 0.5 : 1,
          }}
        >
          {saving ? '…' : t('save_weight')}
        </button>
      </div>
    </div>
  )
}
