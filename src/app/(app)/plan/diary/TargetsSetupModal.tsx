'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { calcTDEE, type ActivityLevel } from '@/lib/nutrition/tdee'
import { deriveTargetsFromTDEE, type FitnessGoal } from '@/lib/nutrition/targets'
import type { DiaryProfile } from './types'

const FITNESS_GOALS: { id: FitnessGoal; icon: string; label: string }[] = [
  { id: 'lose_weight', icon: '🔥', label: 'Lose weight' },
  { id: 'gain_muscle', icon: '💪', label: 'Gain muscle' },
  { id: 'maintain',    icon: '⚖️', label: 'Maintain' },
  { id: 'recomp',      icon: '🔄', label: 'Recomp' },
]
const ACTIVITY_LEVELS: { id: ActivityLevel; label: string }[] = [
  { id: 'sedentary',   label: 'Sedentary (desk job, no exercise)' },
  { id: 'light',       label: 'Light (1–3 days/week)' },
  { id: 'moderate',    label: 'Moderate (3–5 days/week)' },
  { id: 'active',      label: 'Active (6–7 days/week)' },
  { id: 'very_active', label: 'Very active (physical job + exercise)' },
]

interface Props {
  userId: string
  onSaved: (updated: Partial<DiaryProfile>) => void
  onClose: () => void
}

export default function TargetsSetupModal({ userId, onSaved, onClose }: Props) {
  const t = useTranslations('diary')
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | null>(null)
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [activity, setActivity] = useState<ActivityLevel | null>(null)
  const [saving, setSaving] = useState(false)

  const canSave = !!fitnessGoal && !!age && !!weight && !!height && !!activity

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    const ageNum = parseInt(age)
    const weightNum = parseFloat(weight)
    const heightNum = parseFloat(height)
    const tdee = calcTDEE(weightNum, heightNum, ageNum, activity!)
    const targets = deriveTargetsFromTDEE(tdee, fitnessGoal, weightNum)

    const supabase = createClient()
    const update = {
      age: ageNum,
      weight_kg: weightNum,
      height_cm: heightNum,
      activity_level: activity,
      fitness_goal: fitnessGoal,
      estimated_tdee: tdee,
      expenditure_updated_at: new Date().toISOString(),
      expenditure_confidence: 'seed' as const,
      ...targets,
    }
    await supabase.from('profiles').update(update).eq('id', userId)
    setSaving(false)
    onSaved(update)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
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
            {t('setup_targets_title')}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 16, color: 'var(--muted)', cursor: 'pointer', padding: 4 }}>✕</button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 18 }}>
          {t('setup_targets_subtitle')}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-light)', marginBottom: 8 }}>Goal</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {FITNESS_GOALS.map(g => (
              <button key={g.id} onClick={() => setFitnessGoal(g.id)} style={{
                padding: '11px 10px', borderRadius: 10, textAlign: 'left',
                border: fitnessGoal === g.id ? '1.5px solid var(--green)' : '0.5px solid rgba(0,0,0,0.1)',
                background: fitnessGoal === g.id ? 'var(--tag-bg)' : '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 16 }}>{g.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text)' }}>{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Age', value: age, set: setAge, placeholder: 'yrs' },
            { label: 'Weight (kg)', value: weight, set: setWeight, placeholder: 'kg' },
            { label: 'Height (cm)', value: height, set: setHeight, placeholder: 'cm' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-light)', marginBottom: 6 }}>{f.label}</div>
              <input
                type="number" value={f.value} onChange={e => f.set(e.target.value)}
                placeholder={f.placeholder}
                style={{
                  width: '100%', padding: '10px 10px', borderRadius: 8,
                  border: '0.5px solid rgba(0,0,0,0.12)', background: '#fff',
                  fontSize: 13, fontFamily: 'Epilogue, sans-serif', color: 'var(--text)', outline: 'none',
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-light)', marginBottom: 8 }}>Activity level</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {ACTIVITY_LEVELS.map(a => (
              <button key={a.id} onClick={() => setActivity(a.id)} style={{
                padding: '9px 12px', borderRadius: 8, textAlign: 'left',
                border: activity === a.id ? '1.5px solid var(--green)' : '0.5px solid rgba(0,0,0,0.1)',
                background: activity === a.id ? 'var(--tag-bg)' : '#fff',
                fontSize: 10, color: 'var(--text)', cursor: 'pointer',
                fontFamily: 'Epilogue, sans-serif',
              }}>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-dark" onClick={handleSave} disabled={!canSave || saving}>
          {saving ? t('saving_targets') : t('save_targets')}
        </button>
      </div>
    </div>
  )
}
