'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { resizeImageToBase64 } from '@/lib/media/base64'
import MealEstimateReview from './MealEstimateReview'
import type { MealEstimate, MealLog } from './types'

interface Props {
  userId: string
  onLogged: (log: MealLog) => void
  onClose: () => void
}

export default function PhotoLogFlow({ userId, onLogged, onClose }: Props) {
  const t = useTranslations('diary')
  const fileRef = useRef<HTMLInputElement>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [estimate, setEstimate] = useState<MealEstimate | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => { fileRef.current?.click() }, [])

  const handleFile = async (file: File) => {
    setAnalyzing(true)
    setError(false)
    try {
      const { base64, mediaType } = await resizeImageToBase64(file)
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'estimateMealFromImage', base64, mediaType }),
      })
      if (!res.ok) throw new Error('estimate failed')
      const data = await res.json() as MealEstimate
      setEstimate(data)
    } catch {
      setError(true)
    } finally {
      setAnalyzing(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  if (estimate) {
    return (
      <MealEstimateReview
        userId={userId}
        estimate={estimate}
        source="photo"
        onConfirm={onLogged}
        onCancel={onClose}
      />
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 110,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <input
        ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) void handleFile(e.target.files[0]) }}
      />
      <div style={{ background: '#fff', borderRadius: 16, padding: '24px 28px', textAlign: 'center', maxWidth: 280 }}>
        {analyzing ? (
          <>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📷</div>
            <div style={{ fontSize: 12.5, color: 'var(--text)', fontFamily: 'Epilogue, sans-serif' }}>{t('analyzing_meal')}</div>
          </>
        ) : error ? (
          <>
            <div style={{ fontSize: 12.5, color: 'var(--accent)', fontFamily: 'Epilogue, sans-serif', marginBottom: 12 }}>
              {t('estimate_error')}
            </div>
            <button className="btn-dark" onClick={() => fileRef.current?.click()}>{t('retry')}</button>
          </>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'Epilogue, sans-serif' }}>…</div>
        )}
        <button onClick={onClose} style={{ marginTop: 14, background: 'none', border: 'none', color: 'var(--muted)', fontSize: 10.5, cursor: 'pointer', fontFamily: 'Epilogue, sans-serif' }}>
          {t('cancel')}
        </button>
      </div>
    </div>
  )
}
