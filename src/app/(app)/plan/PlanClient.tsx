'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import AppHeader from '@/components/app/AppHeader'
import BottomNav from '@/components/app/BottomNav'
import SegmentedControl from '@/components/app/SegmentedControl'
import { ToastProvider } from '@/components/app/Toast'
import MealPlanPanel from './MealPlanPanel'
import DiaryPanel from './diary/DiaryPanel'
import type { DiaryProfile } from './diary/types'

interface Props {
  profile: (DiaryProfile & { goal?: string | null; dietary_restrictions?: string[] | null }) | null
  userId: string
}

type Tab = 'meal_plan' | 'diary'

function PlanInner({ profile, userId }: Props) {
  const t = useTranslations('plan')
  const [tab, setTab] = useState<Tab>('meal_plan')

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <AppHeader />

      <SegmentedControl
        options={[
          { value: 'meal_plan', label: t('tab_meal_plan') },
          { value: 'diary', label: t('tab_diary') },
        ]}
        value={tab}
        onChange={v => setTab(v as Tab)}
      />

      {tab === 'meal_plan' && <MealPlanPanel profile={profile} />}
      {tab === 'diary' && profile && <DiaryPanel profile={profile} userId={userId} />}

      <BottomNav />
    </div>
  )
}

export default function PlanClient({ profile, userId }: Props) {
  return (
    <ToastProvider>
      <PlanInner profile={profile} userId={userId} />
    </ToastProvider>
  )
}
