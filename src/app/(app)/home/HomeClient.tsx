'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import AppHeader from '@/components/app/AppHeader'
import BottomNav from '@/components/app/BottomNav'
import { ToastProvider, useToast } from '@/components/app/Toast'
import { trackEvent } from '@/lib/analytics/client'
import type { RecipeShoppingList } from '@/lib/claude/recipes'

// Browser speech recognition — not in all TypeScript DOM libs
interface SpeechRec {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((e: { results: { length: number; [key: number]: { isFinal: boolean; [key: number]: { transcript: string } } } }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
type SpeechRecCtor = new () => SpeechRec

const GOAL_IDS = ['weight loss', 'muscle gain', 'balanced', 'indulgence'] as const
const QUICK_ADDS = ['Eggs', 'Rice', 'Tomatoes', 'Feta', 'Chickpeas', 'Garlic', 'Onion', 'Ginger']

interface Profile {
  name?: string | null
  initials?: string | null
  goal?: string | null
  dietary_restrictions?: string[] | null
  intent?: string | null
}

function HomeInner({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const t = useTranslations('home')

  const GOAL_OPTIONS = [
    { id: 'weight loss',  label: t('goal_weight_loss') },
    { id: 'muscle gain',  label: t('goal_muscle_gain') },
    { id: 'balanced',     label: t('goal_balanced') },
    { id: 'indulgence',   label: t('goal_indulgence') },
  ]

  const [ingredients, setIngredients] = useState<string[]>([])
  const [goal, setGoal]               = useState(profile?.goal ?? 'muscle gain')
  const [inputVal, setInputVal]       = useState('')
  const [askOpen, setAskOpen]         = useState(false)
  const [askQuery, setAskQuery]       = useState('')
  const [askResult, setAskResult]     = useState<RecipeShoppingList | null>(null)
  const [askLoading, setAskLoading]   = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript]   = useState('')
  const [analyzingImage, setAnalyzingImage] = useState(false)

  const inputRef    = useRef<HTMLInputElement>(null)
  const photoRef    = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRec | null>(null)

  const addIngredient = useCallback((name: string) => {
    const clean = name.trim().toLowerCase().replace(/[^a-z0-9 '-]/g, '')
    if (!clean || clean.length < 2) return
    setIngredients(prev => prev.includes(clean) ? prev : [...prev, clean])
  }, [])

  // Pre-fill from pantry "use it up" link (?pantry=spinach)
  useEffect(() => {
    const pantryParam = searchParams.get('pantry')
    if (pantryParam) addIngredient(pantryParam)
  }, [searchParams, addIngredient])

  const removeIngredient = (i: number) => setIngredients(prev => prev.filter((_, idx) => idx !== i))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (inputVal.trim()) { addIngredient(inputVal); setInputVal('') }
    }
    if (e.key === 'Backspace' && !inputVal && ingredients.length > 0) {
      removeIngredient(ingredients.length - 1)
    }
  }

  const startListening = useCallback(() => {
    const SRCtor = (
      (window as Window & { SpeechRecognition?: SpeechRecCtor; webkitSpeechRecognition?: SpeechRecCtor }).SpeechRecognition
      ?? (window as Window & { webkitSpeechRecognition?: SpeechRecCtor }).webkitSpeechRecognition
    )
    if (!SRCtor) { showToast(t('voice_not_supported')); return }
    const rec = new SRCtor()
    rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US'
    rec.onresult = (e) => {
      const last = e.results[e.results.length - 1]
      if (!last) return
      const text = last[0]?.transcript ?? ''
      setTranscript(text)
      if (last.isFinal) {
        text.split(/,|\band\b|\bwith\b/i).forEach((p: string) => addIngredient(p.trim()))
        setTranscript('')
      }
    }
    rec.onerror = () => { setIsListening(false); setTranscript('') }
    rec.onend   = () => { setIsListening(false); setTranscript('') }
    recognitionRef.current = rec
    rec.start(); setIsListening(true)
  }, [addIngredient, showToast, t])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop(); setIsListening(false); setTranscript('')
  }, [])

  const processFile = useCallback(async (file: File) => {
    setAnalyzingImage(true)
    try {
      const base64 = await readFileAsBase64(file)
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyzeImage', base64, mediaType: file.type || 'image/jpeg' }),
      })
      const found = await res.json() as string[]
      if (!Array.isArray(found) || found.length === 0) {
        showToast(t('no_ingredients_detected'))
      } else {
        found.forEach(ing => addIngredient(ing))
        showToast(t('found_ingredients', { count: found.length, plural: found.length !== 1 ? 's' : '' }))
      }
    } catch {
      showToast('Could not analyse image — please try again')
    } finally {
      setAnalyzingImage(false)
      if (photoRef.current) photoRef.current.value = ''
    }
  }, [addIngredient, showToast, t])

  const handleAskChef = async () => {
    if (!askQuery.trim()) return
    setAskLoading(true); setAskResult(null)
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lookupRecipeIngredients', recipeName: askQuery.trim() }),
      })
      const data = await res.json() as RecipeShoppingList
      setAskResult(data)
    } finally {
      setAskLoading(false)
    }
  }

  const handleGenerate = () => {
    if (ingredients.length < 2) { showToast(t('min_ingredients')); return }
    const params = new URLSearchParams({
      ingredients: ingredients.join(','),
      goal,
      diet: (profile?.dietary_restrictions ?? []).join(','),
    })
    void trackEvent('recipe_generated', {
      intent: profile?.intent ?? null,
      restrictions: profile?.dietary_restrictions ?? [],
    })
    router.push(`/generating?${params.toString()}`)
  }

  const greeting = t(getGreetingKey())
  const name = profile?.name ?? 'there'
  const initials = profile?.initials ?? name.slice(0, 2).toUpperCase()

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <AppHeader initials={initials} />

      <div className="content-scroll" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="serif" style={{ fontSize: 18, fontWeight: 400, color: 'var(--text)', lineHeight: 1.3 }}>
          {greeting}, {name}.<br />
          <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{t('question')}</em>
        </div>

        {/* Ingredient input */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '10px 12px' }}>
          <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-light)', marginBottom: 8 }}>
            {t('ingredients_label')}
          </div>

          <div
            style={{ display: 'flex', flexWrap: 'wrap', gap: 5, minHeight: 32, cursor: 'text', marginBottom: 8 }}
            onClick={() => inputRef.current?.focus()}
          >
            {ingredients.map((ing, i) => (
              <span key={ing} className="i-tag">
                {ing}
                <span className="i-tag-x" onClick={e => { e.stopPropagation(); removeIngredient(i) }}>✕</span>
              </span>
            ))}
            <input
              ref={inputRef}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={ingredients.length === 0 ? t('type_placeholder') : ''}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 11, fontFamily: 'Epilogue, sans-serif', color: 'var(--text)', minWidth: 120, flex: 1 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={isListening ? stopListening : startListening}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                padding: '7px 8px',
                background: isListening ? '#FEEFEA' : 'var(--surface2)',
                border: isListening ? '1px solid var(--accent)' : '0.5px solid rgba(0,0,0,0.1)',
                borderRadius: 8, fontSize: 9, fontWeight: 500,
                color: isListening ? 'var(--accent)' : 'var(--muted)',
                fontFamily: 'Epilogue, sans-serif', cursor: 'pointer',
              }}
            >
              <MicIcon active={isListening} />
              {isListening ? t('listening') : t('voice_note')}
            </button>

            <button
              onClick={() => photoRef.current?.click()}
              disabled={analyzingImage}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                padding: '7px 8px', background: 'var(--surface2)',
                border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 8,
                fontSize: 9, fontWeight: 500, color: 'var(--muted)',
                fontFamily: 'Epilogue, sans-serif', cursor: analyzingImage ? 'not-allowed' : 'pointer',
                opacity: analyzingImage ? 0.6 : 1,
              }}
            >
              <CameraIcon />
              {analyzingImage ? t('scanning') : t('photo')}
            </button>

            <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) void processFile(e.target.files[0]) }} />
          </div>

          {isListening && transcript && (
            <div style={{ marginTop: 6, padding: '6px 10px', background: '#FEEFEA', borderRadius: 7, fontSize: 10, color: 'var(--accent)', fontStyle: 'italic' }}>
              &ldquo;{transcript}&rdquo;
            </div>
          )}
        </div>

        {/* Quick add */}
        <div>
          <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-light)', marginBottom: 7 }}>{t('quick_add')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {QUICK_ADDS.map(q => (
              <button key={q} onClick={() => addIngredient(q)} style={{
                padding: '5px 10px', borderRadius: 20,
                border: '0.5px dashed rgba(0,0,0,0.15)', background: 'none',
                fontSize: 9, color: 'var(--muted)', cursor: 'pointer',
                fontFamily: 'Epilogue, sans-serif',
              }}>
                + {q}
              </button>
            ))}
          </div>
        </div>

        {/* Goal pills */}
        <div>
          <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-light)', marginBottom: 7 }}>{t('your_goal')}</div>
          <div style={{ display: 'flex', gap: 5 }}>
            {GOAL_OPTIONS.map(g => (
              <button key={g.id} onClick={() => setGoal(g.id)} style={{
                flex: 1, padding: '7px 4px', borderRadius: 10,
                border: goal === g.id ? '1px solid var(--green)' : '0.5px solid rgba(0,0,0,0.1)',
                background: goal === g.id ? 'var(--tag-bg)' : '#fff',
                fontSize: 8, fontWeight: 500,
                color: goal === g.id ? 'var(--green)' : 'var(--muted)',
                cursor: 'pointer', fontFamily: 'Epilogue, sans-serif', textAlign: 'center',
              }}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-accent" onClick={handleGenerate} disabled={ingredients.length < 2} style={{ marginTop: 4 }}>
          {t('generate_btn')}
        </button>

        {/* Ask Chef */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: '0.5px', background: 'rgba(0,0,0,0.08)' }} />
          <button
            onClick={() => { setAskOpen(v => !v); setAskResult(null) }}
            style={{ fontSize: 10, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Epilogue, sans-serif', whiteSpace: 'nowrap' }}
          >
            {askOpen ? 'Close ✕' : 'Ask about a recipe →'}
          </button>
          <div style={{ flex: 1, height: '0.5px', background: 'rgba(0,0,0,0.08)' }} />
        </div>

        {askOpen && (
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '12px' }}>
            <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-light)', marginBottom: 8 }}>
              WHAT DO YOU NEED?
            </div>
            <div style={{ display: 'flex', gap: 7 }}>
              <input
                value={askQuery}
                onChange={e => setAskQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') void handleAskChef() }}
                placeholder="e.g. Pad Thai, Jollof Rice…"
                style={{ flex: 1, border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 8, padding: '8px 10px', fontSize: 11, fontFamily: 'Epilogue, sans-serif', outline: 'none', color: 'var(--text)' }}
              />
              <button
                onClick={() => void handleAskChef()}
                disabled={askLoading}
                style={{ padding: '8px 14px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 500, fontFamily: 'Epilogue, sans-serif', cursor: askLoading ? 'not-allowed' : 'pointer', opacity: askLoading ? 0.6 : 1 }}
              >
                {askLoading ? '…' : 'Ask'}
              </button>
            </div>
            {askResult && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', fontFamily: 'Epilogue, sans-serif', marginBottom: 6 }}>
                  {askResult.recipeName}
                </div>
                {askResult.ingredients.map((ing, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '0.5px solid rgba(0,0,0,0.05)', fontSize: 10, fontFamily: 'Epilogue, sans-serif' }}>
                    <span style={{ color: 'var(--text)' }}>{ing.item}</span>
                    <span style={{ color: 'var(--muted)' }}>{ing.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

export default function HomeClient({ profile }: { profile: Profile | null }) {
  return (
    <ToastProvider>
      <HomeInner profile={profile} />
    </ToastProvider>
  )
}

function getGreetingKey(): 'greeting_morning' | 'greeting_afternoon' | 'greeting_evening' {
  const h = new Date().getHours()
  if (h < 12) return 'greeting_morning'
  if (h < 17) return 'greeting_afternoon'
  return 'greeting_evening'
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const result = (e.target?.result as string) ?? ''
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function MicIcon({ active }: { active: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke={active ? 'var(--accent)' : 'var(--muted)'} strokeWidth="1.8" strokeLinecap="round">
      <rect x="6" y="2" width="8" height="11" rx="4"/>
      <path d="M3 10a7 7 0 0014 0M10 17v3"/>
    </svg>
  )
}
function CameraIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7.5A1.5 1.5 0 013.5 6h1.086a1.5 1.5 0 001.342-.83L7 3h6l1.072 2.17A1.5 1.5 0 0015.414 6H16.5A1.5 1.5 0 0118 7.5V15a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 012 15V7.5z"/>
      <circle cx="10" cy="11" r="3"/>
    </svg>
  )
}
