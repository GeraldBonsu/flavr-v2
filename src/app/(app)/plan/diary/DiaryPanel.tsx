'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import CalorieRing from '@/components/app/CalorieRing'
import MacroBars from '@/components/app/MacroBars'
import { useToast } from '@/components/app/Toast'
import TargetsSetupModal from './TargetsSetupModal'
import WeightLogPrompt from './WeightLogPrompt'
import MealEntrySheet from './MealEntrySheet'
import UpsellCard from './UpsellCard'
import { todayISODate, addDaysISO, isSameOrFutureDay } from './utils'
import type { DiaryProfile, MealLog, MealType } from './types'

interface Props {
  profile: DiaryProfile
  userId: string
}

const MEAL_TYPE_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

const EXPENDITURE_STALE_DAYS = 8

export default function DiaryPanel({ profile: initialProfile, userId }: Props) {
  const t = useTranslations('diary')
  const { showToast } = useToast()

  const [profile, setProfile] = useState<DiaryProfile>(initialProfile)
  const [selectedDate, setSelectedDate] = useState(todayISODate())
  const [logs, setLogs] = useState<MealLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(true)
  const [showTargetsModal, setShowTargetsModal] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [hasRecentWeight, setHasRecentWeight] = useState<boolean | null>(null)

  const isPremium = profile.subscription_tier === 'premium'
  const hasTargets = profile.age != null && profile.weight_kg != null && profile.height_cm != null && profile.activity_level != null

  useEffect(() => {
    if (!isPremium) return
    if (!hasTargets) return
    if (profile.expenditure_updated_at) {
      const ageDays = (Date.now() - new Date(profile.expenditure_updated_at).getTime()) / 86400000
      if (ageDays < EXPENDITURE_STALE_DAYS) return
    }
    void fetch('/api/nutrition/refresh-expenditure', { method: 'POST' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium, hasTargets])

  useEffect(() => {
    if (!isPremium) { setLoadingLogs(false); return }
    setLoadingLogs(true)
    const supabase = createClient()
    const start = `${selectedDate}T00:00:00.000Z`
    const end = `${addDaysISO(selectedDate, 1)}T00:00:00.000Z`
    supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', start)
      .lt('logged_at', end)
      .order('logged_at', { ascending: true })
      .then(({ data }) => {
        setLogs((data ?? []) as MealLog[])
        setLoadingLogs(false)
      })
  }, [selectedDate, userId, isPremium])

  useEffect(() => {
    if (!isPremium) return
    const supabase = createClient()
    const since = addDaysISO(todayISODate(), -7)
    supabase
      .from('weight_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('logged_at', since)
      .then(({ count }) => setHasRecentWeight((count ?? 0) > 0))
  }, [userId, isPremium])

  const totals = useMemo(() => logs.reduce((acc, log) => ({
    calories: acc.calories + log.calories,
    protein_g: acc.protein_g + log.protein_g,
    carbs_g: acc.carbs_g + log.carbs_g,
    fat_g: acc.fat_g + log.fat_g,
  }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }), [logs])

  const grouped = useMemo(() => {
    return MEAL_TYPE_ORDER.map(type => ({
      type,
      items: logs.filter(l => l.meal_type === type),
    })).filter(g => g.items.length > 0)
  }, [logs])

  const handleDelete = async (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id))
    const supabase = createClient()
    await supabase.from('meal_logs').delete().eq('id', id)
  }

  const handleLogged = (log: MealLog) => {
    setSheetOpen(false)
    if (log.logged_at.slice(0, 10) === selectedDate) {
      setLogs(prev => [...prev, log])
    }
    showToast(t('meal_logged'))
  }

  const dateLabel = selectedDate === todayISODate()
    ? t('today')
    : selectedDate === addDaysISO(todayISODate(), -1)
    ? t('yesterday')
    : selectedDate

  if (!isPremium) {
    return (
      <div className="content-scroll" style={{ padding: '12px 16px' }}>
        <UpsellCard />
      </div>
    )
  }

  return (
    <div className="content-scroll" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Date nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => setSelectedDate(d => addDaysISO(d, -1))}
          style={{ background: 'none', border: 'none', fontSize: 14, color: 'var(--muted)', cursor: 'pointer', padding: 4 }}
        >
          ‹
        </button>
        <div className="serif" style={{ fontSize: 15, color: 'var(--text)' }}>{dateLabel}</div>
        <button
          onClick={() => setSelectedDate(d => addDaysISO(d, 1))}
          disabled={isSameOrFutureDay(addDaysISO(selectedDate, 1))}
          style={{ background: 'none', border: 'none', fontSize: 14, color: 'var(--muted)', cursor: 'pointer', padding: 4, opacity: isSameOrFutureDay(addDaysISO(selectedDate, 1)) ? 0.3 : 1 }}
        >
          ›
        </button>
      </div>

      {!hasTargets ? (
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 'var(--r-card)', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 10, fontFamily: 'Epilogue, sans-serif' }}>{t('no_target_set')}</div>
          <button className="btn-dark" onClick={() => setShowTargetsModal(true)}>{t('setup_targets_title')}</button>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 'var(--r-card)', padding: '14px', display: 'flex', gap: 14, alignItems: 'center' }}>
          <CalorieRing consumed={totals.calories} target={profile.target_calories ?? 0} />
          <MacroBars items={[
            { label: t('protein'), consumed: totals.protein_g, target: profile.target_protein_g ?? 0 },
            { label: t('carbs'), consumed: totals.carbs_g, target: profile.target_carbs_g ?? 0 },
            { label: t('fat'), consumed: totals.fat_g, target: profile.target_fat_g ?? 0 },
          ]} />
        </div>
      )}

      {hasRecentWeight === false && (
        <WeightLogPrompt userId={userId} onLogged={() => setHasRecentWeight(true)} />
      )}

      {/* Meal list */}
      {loadingLogs ? null : grouped.length === 0 ? (
        <div style={{ fontSize: 11, color: 'var(--muted-light)', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>
          {t('no_meals_logged')}
        </div>
      ) : (
        grouped.map(group => (
          <div key={group.type}>
            <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-light)', marginBottom: 6 }}>
              {t(group.type)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {group.items.map(item => (
                <div key={item.id} style={{
                  background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 10,
                  padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text)', fontFamily: 'Epilogue, sans-serif' }}>{item.name}</div>
                    <div style={{ fontSize: 9.5, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                      {item.calories} kcal · {Math.round(item.protein_g)}P {Math.round(item.carbs_g)}C {Math.round(item.fat_g)}F
                    </div>
                  </div>
                  <button
                    onClick={() => void handleDelete(item.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, padding: 4 }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Add meal button */}
      <button
        onClick={() => setSheetOpen(true)}
        className="btn-accent"
        style={{ position: 'sticky', bottom: 8, marginTop: 4 }}
      >
        {t('add_meal')}
      </button>

      {showTargetsModal && (
        <TargetsSetupModal
          userId={userId}
          onClose={() => setShowTargetsModal(false)}
          onSaved={updated => {
            setProfile(prev => ({ ...prev, ...updated } as DiaryProfile))
            setShowTargetsModal(false)
          }}
        />
      )}

      {sheetOpen && (
        <MealEntrySheet userId={userId} onLogged={handleLogged} onClose={() => setSheetOpen(false)} />
      )}
    </div>
  )
}
