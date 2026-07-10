'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import MealEstimateReview from './MealEstimateReview'
import type { MealEstimate, MealLog } from './types'

interface Props {
  userId: string
  onLogged: (log: MealLog) => void
  onClose: () => void
}

export default function DescribeLogFlow({ userId, onLogged, onClose }: Props) {
  const t = useTranslations('diary')
  const [description, setDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [estimate, setEstimate] = useState<MealEstimate | null>(null)
  const [error, setError] = useState(false)

  const handleAnalyze = async () => {
    if (!description.trim()) return
    setAnalyzing(true)
    setError(false)
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'estimateMealFromText', description: description.trim() }),
      })
      if (!res.ok) throw new Error('estimate failed')
      const data = await res.json() as MealEstimate
      setEstimate(data)
    } catch {
      setError(true)
    } finally {
      setAnalyzing(false)
    }
  }

  if (estimate) {
    return (
      <MealEstimateReview
        userId={userId}
        estimate={estimate}
        source="manual"
        onConfirm={onLogged}
        onCancel={onClose}
      />
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 110,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 430,
        background: 'var(--bg)', borderRadius: '20px 20px 0 0',
        padding: '20px 20px calc(20px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div className="serif" style={{ fontSize: 20, fontWeight: 400, color: 'var(--text)' }}>
            {t('describe_meal')}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 16, color: 'var(--muted)', cursor: 'pointer', padding: 4 }}>✕</button>
        </div>

        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={t('describe_placeholder')}
          rows={3}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 12,
            border: '0.5px solid rgba(0,0,0,0.12)', background: '#fff',
            fontSize: 13, fontFamily: 'Epilogue, sans-serif', color: 'var(--text)',
            outline: 'none', resize: 'none', marginBottom: 14,
          }}
        />

        {error && (
          <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 10 }}>{t('estimate_error')}</div>
        )}

        <button className="btn-dark" onClick={() => void handleAnalyze()} disabled={!description.trim() || analyzing}>
          {analyzing ? t('analyzing_meal') : t('estimate_btn')}
        </button>
      </div>
    </div>
  )
}
