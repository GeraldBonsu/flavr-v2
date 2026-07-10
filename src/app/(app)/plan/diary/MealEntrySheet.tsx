'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import PhotoLogFlow from './PhotoLogFlow'
import DescribeLogFlow from './DescribeLogFlow'
import RecipePickerFlow from './RecipePickerFlow'
import type { MealLog } from './types'

interface Props {
  userId: string
  onLogged: (log: MealLog) => void
  onClose: () => void
}

type Flow = 'photo' | 'describe' | 'recipe' | null

export default function MealEntrySheet({ userId, onLogged, onClose }: Props) {
  const t = useTranslations('diary')
  const [flow, setFlow] = useState<Flow>(null)

  if (flow === 'photo') {
    return <PhotoLogFlow userId={userId} onLogged={onLogged} onClose={() => setFlow(null)} />
  }
  if (flow === 'describe') {
    return <DescribeLogFlow userId={userId} onLogged={onLogged} onClose={() => setFlow(null)} />
  }
  if (flow === 'recipe') {
    return <RecipePickerFlow userId={userId} onLogged={onLogged} onClose={() => setFlow(null)} />
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 105,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div
        style={{
          width: '100%', maxWidth: 430,
          background: 'var(--bg)', borderRadius: '20px 20px 0 0',
          padding: '20px 20px calc(20px + env(safe-area-inset-bottom, 0px))',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="serif" style={{ fontSize: 18, fontWeight: 400, color: 'var(--text)', marginBottom: 8 }}>
          {t('add_meal')}
        </div>
        {[
          { key: 'photo' as const, icon: '📷', label: t('take_photo') },
          { key: 'describe' as const, icon: '✏️', label: t('describe_meal') },
          { key: 'recipe' as const, icon: '📖', label: t('from_saved_recipe') },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => setFlow(opt.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px', borderRadius: 12,
              border: '0.5px solid rgba(0,0,0,0.1)', background: '#fff',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 20 }}>{opt.icon}</span>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text)', fontFamily: 'Epilogue, sans-serif' }}>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
