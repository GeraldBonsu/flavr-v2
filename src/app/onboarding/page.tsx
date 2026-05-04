'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics/client'

type Intent = 'eat_better' | 'fitness_goal' | 'explore_culture' | 'casual'
type FitnessGoal = 'lose_weight' | 'gain_muscle' | 'maintain' | 'recomp'
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light:     1.375,
  moderate:  1.55,
  active:    1.725,
  very_active: 1.9,
}

function calcTDEE(weight: number, height: number, age: number, activity: ActivityLevel): number {
  // Mifflin-St Jeor (gender-neutral: average of male+female)
  const bmrMale   = 10 * weight + 6.25 * height - 5 * age + 5
  const bmrFemale = 10 * weight + 6.25 * height - 5 * age - 161
  const bmr = (bmrMale + bmrFemale) / 2
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity])
}

const DIETARY_OPTIONS = [
  'Halal', 'Vegan', 'Vegetarian', 'Gluten-free',
  'Dairy-free', 'No pork', 'Keto', 'Paleo',
]
const CULTURAL_OPTIONS = [
  'Mediterranean', 'South Asian', 'East Asian', 'West African',
  'Latin American', 'Middle Eastern', 'Caribbean', 'Nordic',
]

export default function OnboardingPage() {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step 1 — intent
  const [intent, setIntent] = useState<Intent | null>(null)

  // Step 2 — fitness branch
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | null>(null)
  const [age, setAge]           = useState('')
  const [weight, setWeight]     = useState('')
  const [height, setHeight]     = useState('')
  const [activity, setActivity] = useState<ActivityLevel | null>(null)
  const [calories, setCalories] = useState('')

  // Step 2 — culture / eat_better branches
  const [culturalPrefs, setCulturalPrefs] = useState<string[]>([])

  // Step 3 — dietary (shown to all, skip if already captured)
  const [dietary, setDietary]   = useState<string[]>([])
  const [otherDiet, setOtherDiet] = useState('')

  const progress = (step / 4) * 100
  const totalSteps = 4

  // Step 2 is skipped for 'casual' if dietary was already in step 2
  const step2Label = () => {
    if (intent === 'fitness_goal') return 'Your fitness profile'
    if (intent === 'eat_better')    return 'Your preferences'
    if (intent === 'explore_culture') return 'Cultural interests'
    return 'Quick setup'
  }

  const handleCalc = () => {
    if (!weight || !height || !age || !activity) return
    const tdee = calcTDEE(parseFloat(weight), parseFloat(height), parseInt(age), activity)
    setCalories(String(tdee))
  }

  const toggleArray = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const canProceed = () => {
    if (step === 1) return intent !== null
    if (step === 2) {
      if (intent === 'fitness_goal') return fitnessGoal !== null && !!age && !!weight && !!height && activity !== null
      return true
    }
    return true
  }

  const handleNext = async () => {
    void trackEvent('onboarding_step_completed', { step })

    if (step < totalSteps) {
      setStep(s => s + 1)
      return
    }

    // Step 4: save to Supabase
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const allDietary = [...dietary, ...(otherDiet.trim() ? [otherDiet.trim()] : [])]

    await supabase.from('profiles').update({
      intent,
      fitness_goal:          intent === 'fitness_goal' ? fitnessGoal : null,
      age:                   intent === 'fitness_goal' && age ? parseInt(age) : null,
      weight_kg:             intent === 'fitness_goal' && weight ? parseFloat(weight) : null,
      height_cm:             intent === 'fitness_goal' && height ? parseFloat(height) : null,
      activity_level:        intent === 'fitness_goal' ? activity : null,
      target_calories:       intent === 'fitness_goal' && calories ? parseInt(calories) : null,
      dietary_restrictions:  allDietary.length > 0 ? allDietary : null,
      cultural_preferences:  culturalPrefs.length > 0 ? culturalPrefs : null,
      onboarding_completed_at: new Date().toISOString(),
    }).eq('id', user.id)

    void trackEvent('onboarding_completed', { intent })
    router.push('/home')
    router.refresh()
  }

  // Track start on mount
  useState(() => { void trackEvent('onboarding_started') })

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="app-header">
        <div className="logo">flavr<span className="logo-dot">.</span></div>
        {step > 1 && (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--muted)', cursor: 'pointer', fontFamily: 'Epilogue, sans-serif' }}
          >
            ← Back
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(0,0,0,0.06)', margin: '0 18px', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.3s ease' }} />
      </div>

      <div className="content-scroll" style={{ padding: '16px 18px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
          Step {step} of {totalSteps}
        </div>

        {step === 1 && <Step1Intent intent={intent} setIntent={setIntent} />}
        {step === 2 && intent === 'fitness_goal' && (
          <Step2Fitness
            fitnessGoal={fitnessGoal} setFitnessGoal={setFitnessGoal}
            age={age} setAge={setAge}
            weight={weight} setWeight={setWeight}
            height={height} setHeight={setHeight}
            activity={activity} setActivity={setActivity}
            calories={calories} setCalories={setCalories}
            onCalc={handleCalc}
          />
        )}
        {step === 2 && (intent === 'eat_better' || intent === 'explore_culture') && (
          <Step2Culture
            intent={intent}
            culturalPrefs={culturalPrefs}
            setCulturalPrefs={v => setCulturalPrefs(v)}
            dietary={dietary}
            setDietary={v => setDietary(v)}
          />
        )}
        {step === 2 && intent === 'casual' && (
          <Step2Casual dietary={dietary} setDietary={v => setDietary(v)} />
        )}
        {step === 3 && (
          <Step3Dietary
            dietary={dietary} setDietary={v => setDietary(v)}
            otherDiet={otherDiet} setOtherDiet={setOtherDiet}
            alreadyAsked={intent === 'eat_better' || intent === 'explore_culture' || intent === 'casual'}
          />
        )}
        {step === 4 && (
          <Step4Confirm
            intent={intent}
            fitnessGoal={fitnessGoal}
            calories={calories}
            dietary={dietary}
            culturalPrefs={culturalPrefs}
            otherDiet={otherDiet}
          />
        )}
      </div>

      <div style={{ padding: '10px 18px 20px', flexShrink: 0 }}>
        <button className="btn-dark" onClick={handleNext} disabled={!canProceed() || saving}>
          {step < totalSteps ? 'Continue →' : saving ? 'Saving…' : 'Get cooking →'}
        </button>
      </div>
    </div>
  )
}

/* ── Step 1: Intent ────────────────────────────────────────────────── */
const INTENTS: { id: Intent; icon: string; label: string; sub: string }[] = [
  { id: 'fitness_goal',    icon: '💪', label: 'Hit a fitness goal', sub: 'Lose weight, gain muscle, or recomp' },
  { id: 'eat_better',      icon: '🥗', label: 'Eat better',         sub: 'Cleaner meals, better habits' },
  { id: 'explore_culture', icon: '🌍', label: 'Explore cuisines',   sub: 'Discover world flavours' },
  { id: 'casual',          icon: '🍳', label: 'Just cooking',       sub: 'No agenda, just good food' },
]

function Step1Intent({ intent, setIntent }: { intent: Intent | null; setIntent: (v: Intent) => void }) {
  return (
    <>
      <div className="serif" style={{ fontSize: 22, fontWeight: 400, color: 'var(--text)', marginBottom: 4 }}>
        What brings you to flavr?
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 20 }}>
        We'll personalise everything to match your goals
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {INTENTS.map(i => (
          <button
            key={i.id}
            onClick={() => setIntent(i.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 14px',
              border: intent === i.id ? '1.5px solid var(--green)' : '0.5px solid rgba(0,0,0,0.1)',
              borderRadius: 12,
              background: intent === i.id ? 'var(--tag-bg)' : '#fff',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 24, flexShrink: 0 }}>{i.icon}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{i.label}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>{i.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}

/* ── Step 2: Fitness ───────────────────────────────────────────────── */
const FITNESS_GOALS: { id: FitnessGoal; icon: string; label: string }[] = [
  { id: 'lose_weight',  icon: '🔥', label: 'Lose weight' },
  { id: 'gain_muscle',  icon: '💪', label: 'Gain muscle' },
  { id: 'maintain',     icon: '⚖️', label: 'Maintain' },
  { id: 'recomp',       icon: '🔄', label: 'Recomp' },
]
const ACTIVITY_LEVELS: { id: ActivityLevel; label: string }[] = [
  { id: 'sedentary',   label: 'Sedentary (desk job, no exercise)' },
  { id: 'light',       label: 'Light (1–3 days/week)' },
  { id: 'moderate',    label: 'Moderate (3–5 days/week)' },
  { id: 'active',      label: 'Active (6–7 days/week)' },
  { id: 'very_active', label: 'Very active (physical job + exercise)' },
]

function Step2Fitness({
  fitnessGoal, setFitnessGoal, age, setAge, weight, setWeight,
  height, setHeight, activity, setActivity, calories, setCalories, onCalc,
}: {
  fitnessGoal: FitnessGoal | null; setFitnessGoal: (v: FitnessGoal) => void
  age: string; setAge: (v: string) => void
  weight: string; setWeight: (v: string) => void
  height: string; setHeight: (v: string) => void
  activity: ActivityLevel | null; setActivity: (v: ActivityLevel) => void
  calories: string; setCalories: (v: string) => void
  onCalc: () => void
}) {
  return (
    <>
      <div className="serif" style={{ fontSize: 22, fontWeight: 400, color: 'var(--text)', marginBottom: 4 }}>
        Your fitness profile
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 18 }}>
        We'll tailor macros and recipes to your goal
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-light)', marginBottom: 8 }}>Goal</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
          {FITNESS_GOALS.map(g => (
            <button key={g.id} onClick={() => setFitnessGoal(g.id)} style={{
              padding: '11px 10px', borderRadius: 10, textAlign: 'left',
              border: fitnessGoal === g.id ? '1.5px solid var(--green)' : '0.5px solid rgba(0,0,0,0.1)',
              background: fitnessGoal === g.id ? 'var(--tag-bg)' : '#fff',
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 16 }}>{g.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text)' }}>{g.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Age', value: age, set: setAge, placeholder: 'yrs', type: 'number' },
          { label: 'Weight (kg)', value: weight, set: setWeight, placeholder: 'kg', type: 'number' },
          { label: 'Height (cm)', value: height, set: setHeight, placeholder: 'cm', type: 'number' },
        ].map(f => (
          <div key={f.label}>
            <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-light)', marginBottom: 6 }}>{f.label}</div>
            <input
              type={f.type} value={f.value} onChange={e => f.set(e.target.value)}
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

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-light)', marginBottom: 8 }}>Activity level</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {ACTIVITY_LEVELS.map(a => (
            <button key={a.id} onClick={() => setActivity(a.id)} style={{
              padding: '9px 12px', borderRadius: 8, textAlign: 'left',
              border: activity === a.id ? '1.5px solid var(--green)' : '0.5px solid rgba(0,0,0,0.1)',
              background: activity === a.id ? 'var(--tag-bg)' : '#fff',
              fontSize: 10, color: 'var(--text)', cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: 'Epilogue, sans-serif',
            }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-light)', marginBottom: 8 }}>Daily calorie target</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="number" value={calories} onChange={e => setCalories(e.target.value)}
            placeholder="e.g. 2200"
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 8,
              border: '0.5px solid rgba(0,0,0,0.12)', background: '#fff',
              fontSize: 13, fontFamily: 'Epilogue, sans-serif', color: 'var(--text)', outline: 'none',
            }}
          />
          <button
            onClick={onCalc}
            disabled={!weight || !height || !age || !activity}
            style={{
              padding: '10px 12px', borderRadius: 8,
              background: 'var(--green)', color: '#fff',
              border: 'none', fontSize: 9, fontWeight: 500,
              fontFamily: 'Epilogue, sans-serif', cursor: 'pointer',
              opacity: (!weight || !height || !age || !activity) ? 0.4 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            Calculate for me
          </button>
        </div>
      </div>
    </>
  )
}

/* ── Step 2: Culture / Eat Better ─────────────────────────────────── */
function Step2Culture({
  intent, culturalPrefs, setCulturalPrefs, dietary, setDietary,
}: {
  intent: Intent
  culturalPrefs: string[]; setCulturalPrefs: (v: string[]) => void
  dietary: string[]; setDietary: (v: string[]) => void
}) {
  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  return (
    <>
      <div className="serif" style={{ fontSize: 22, fontWeight: 400, color: 'var(--text)', marginBottom: 4 }}>
        {intent === 'explore_culture' ? 'What cuisines interest you?' : 'Your food preferences'}
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 18 }}>Select all that apply</div>

      {(intent === 'explore_culture' || intent === 'eat_better') && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-light)', marginBottom: 8 }}>
            {intent === 'explore_culture' ? 'Cuisines' : 'Cultural preferences'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CULTURAL_OPTIONS.map(c => (
              <button key={c} onClick={() => toggle(culturalPrefs, setCulturalPrefs, c)} style={{
                padding: '7px 13px', borderRadius: 20, fontSize: 10, fontWeight: 500,
                border: culturalPrefs.includes(c) ? '1.5px solid var(--green)' : '0.5px solid rgba(0,0,0,0.12)',
                background: culturalPrefs.includes(c) ? 'var(--tag-bg)' : '#fff',
                color: culturalPrefs.includes(c) ? 'var(--green)' : 'var(--muted)',
                cursor: 'pointer', fontFamily: 'Epilogue, sans-serif', transition: 'all 0.15s',
              }}>{c}</button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-light)', marginBottom: 8 }}>Dietary restrictions</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {DIETARY_OPTIONS.map(d => (
            <button key={d} onClick={() => toggle(dietary, setDietary, d)} style={{
              padding: '7px 13px', borderRadius: 20, fontSize: 10, fontWeight: 500,
              border: dietary.includes(d) ? '1.5px solid var(--green)' : '0.5px solid rgba(0,0,0,0.12)',
              background: dietary.includes(d) ? 'var(--tag-bg)' : '#fff',
              color: dietary.includes(d) ? 'var(--green)' : 'var(--muted)',
              cursor: 'pointer', fontFamily: 'Epilogue, sans-serif', transition: 'all 0.15s',
            }}>{d}</button>
          ))}
        </div>
      </div>
    </>
  )
}

/* ── Step 2: Casual ────────────────────────────────────────────────── */
function Step2Casual({ dietary, setDietary }: { dietary: string[]; setDietary: (v: string[]) => void }) {
  const toggle = (val: string) => setDietary(dietary.includes(val) ? dietary.filter(x => x !== val) : [...dietary, val])
  return (
    <>
      <div className="serif" style={{ fontSize: 22, fontWeight: 400, color: 'var(--text)', marginBottom: 4 }}>
        Any dietary needs?
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 18 }}>
        Select any that apply, or skip right ahead
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {DIETARY_OPTIONS.map(d => (
          <button key={d} onClick={() => toggle(d)} style={{
            padding: '7px 13px', borderRadius: 20, fontSize: 10, fontWeight: 500,
            border: dietary.includes(d) ? '1.5px solid var(--green)' : '0.5px solid rgba(0,0,0,0.12)',
            background: dietary.includes(d) ? 'var(--tag-bg)' : '#fff',
            color: dietary.includes(d) ? 'var(--green)' : 'var(--muted)',
            cursor: 'pointer', fontFamily: 'Epilogue, sans-serif', transition: 'all 0.15s',
          }}>{d}</button>
        ))}
      </div>
    </>
  )
}

/* ── Step 3: Dietary (full, for fitness_goal users) ───────────────── */
function Step3Dietary({
  dietary, setDietary, otherDiet, setOtherDiet, alreadyAsked,
}: {
  dietary: string[]; setDietary: (v: string[]) => void
  otherDiet: string; setOtherDiet: (v: string) => void
  alreadyAsked: boolean
}) {
  const toggle = (val: string) => setDietary(dietary.includes(val) ? dietary.filter(x => x !== val) : [...dietary, val])

  if (alreadyAsked) {
    return (
      <>
        <div className="serif" style={{ fontSize: 22, fontWeight: 400, color: 'var(--text)', marginBottom: 4 }}>
          Anything else we should know?
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 18 }}>
          Any specific allergies or restrictions not listed
        </div>
        <input
          type="text" value={otherDiet} onChange={e => setOtherDiet(e.target.value)}
          placeholder="e.g. tree nut allergy, low-sodium..."
          className="form-input"
        />
      </>
    )
  }

  return (
    <>
      <div className="serif" style={{ fontSize: 22, fontWeight: 400, color: 'var(--text)', marginBottom: 4 }}>
        Dietary restrictions
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 18 }}>
        Select all that apply — we'll never suggest meals that don't fit
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {DIETARY_OPTIONS.map(d => (
          <button key={d} onClick={() => toggle(d)} style={{
            padding: '7px 13px', borderRadius: 20, fontSize: 10, fontWeight: 500,
            border: dietary.includes(d) ? '1.5px solid var(--green)' : '0.5px solid rgba(0,0,0,0.12)',
            background: dietary.includes(d) ? 'var(--tag-bg)' : '#fff',
            color: dietary.includes(d) ? 'var(--green)' : 'var(--muted)',
            cursor: 'pointer', fontFamily: 'Epilogue, sans-serif', transition: 'all 0.15s',
          }}>{d}</button>
        ))}
      </div>
      <input
        type="text" value={otherDiet} onChange={e => setOtherDiet(e.target.value)}
        placeholder="Other (e.g. tree nut allergy)"
        className="form-input"
      />
    </>
  )
}

/* ── Step 4: Confirmation ──────────────────────────────────────────── */
const INTENT_LABELS: Record<Intent, string> = {
  fitness_goal:    'Hit a fitness goal',
  eat_better:      'Eat better',
  explore_culture: 'Explore cuisines',
  casual:          'Just cooking',
}
const FITNESS_LABELS: Record<FitnessGoal, string> = {
  lose_weight: 'Lose weight', gain_muscle: 'Gain muscle', maintain: 'Maintain', recomp: 'Body recomp',
}

function Step4Confirm({
  intent, fitnessGoal, calories, dietary, culturalPrefs, otherDiet,
}: {
  intent: Intent | null; fitnessGoal: FitnessGoal | null; calories: string
  dietary: string[]; culturalPrefs: string[]; otherDiet: string
}) {
  const allDietary = [...dietary, ...(otherDiet.trim() ? [otherDiet.trim()] : [])]
  return (
    <>
      <div className="serif" style={{ fontSize: 22, fontWeight: 400, color: 'var(--text)', marginBottom: 4 }}>
        You're all set!
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 24 }}>
        Here's your flavr. profile
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {intent && (
          <SummaryRow label="Goal" value={INTENT_LABELS[intent]} />
        )}
        {fitnessGoal && (
          <SummaryRow label="Fitness target" value={FITNESS_LABELS[fitnessGoal]} />
        )}
        {calories && (
          <SummaryRow label="Daily calories" value={`${calories} kcal`} />
        )}
        {allDietary.length > 0 && (
          <SummaryRow label="Dietary" value={allDietary.join(', ')} />
        )}
        {culturalPrefs.length > 0 && (
          <SummaryRow label="Cuisines" value={culturalPrefs.join(', ')} />
        )}
      </div>

      <div style={{ marginTop: 24, padding: '14px', background: 'var(--tag-bg)', borderRadius: 12 }}>
        <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 500, marginBottom: 4 }}>
          You can update these anytime in Account settings
        </div>
        <div style={{ fontSize: 9, color: 'var(--muted)' }}>
          Your recipes, macros, and meal plans will be personalised based on this profile.
        </div>
      </div>
    </>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 12px', background: '#fff', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.08)' }}>
      <span style={{ fontSize: 10, color: 'var(--muted)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text)', textAlign: 'right', marginLeft: 12 }}>{value}</span>
    </div>
  )
}
