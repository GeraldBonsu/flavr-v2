'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface Props {
  recipeId: string
  recipeName: string
  emoji: string
  steps: string[]
}

// Detect a duration in a step and return seconds (or null)
function parseDuration(text: string): number | null {
  const m = text.match(/(\d+)\s*(?:–|-|to\s*\d+)?\s*(min(?:ute)?s?|sec(?:ond)?s?)/i)
  if (!m) return null
  const val = parseInt(m[1] ?? '0')
  const unit = (m[2] ?? '').toLowerCase()
  return unit.startsWith('sec') ? val : val * 60
}

// Highlight duration phrases in step text with accent-soft italic spans
function highlightStep(text: string) {
  const parts = text.split(/(\d+\s*(?:–|-|to\s*\d+)?\s*(?:min(?:ute)?s?|sec(?:ond)?s?|hour?s?)|until [^.,]+)/gi)
  return parts.map((part, i) =>
    i % 2 === 1
      ? <em key={i} style={{ fontStyle: 'italic', color: 'var(--accent-soft)' }}>{part}</em>
      : part
  )
}

// Extract a tip: second sentence of a step, or a short fallback
function extractTip(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/)
  if (sentences.length >= 2) return sentences.slice(1).join(' ')
  return 'Take your time — consistency beats speed here.'
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function beep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.start(); osc.stop(ctx.currentTime + 0.6)
  } catch { /* AudioContext not available */ }
}

export default function CookClient({ recipeId, recipeName, emoji, steps }: Props) {
  const router = useRouter()
  const t = useTranslations('cook')
  const [stepIdx, setStepIdx]     = useState(0)
  const [elapsed, setElapsed]     = useState(0)
  const [timerSec, setTimerSec]   = useState<number | null>(null)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerDone, setTimerDone] = useState(false)

  const wakeLockRef  = useRef<WakeLockSentinel | null>(null)
  const elapsedRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentStep = steps[stepIdx] ?? ''
  const duration    = parseDuration(currentStep)
  const tip         = extractTip(currentStep)
  const isLast      = stepIdx === steps.length - 1

  // Overall elapsed timer
  useEffect(() => {
    elapsedRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current) }
  }, [])

  // Wake lock
  useEffect(() => {
    const acquire = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch { /* wake lock not available */ }
    }
    void acquire()
    return () => { void wakeLockRef.current?.release() }
  }, [])

  // Reset timer when step changes
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimerRunning(false)
    setTimerDone(false)
    setTimerSec(duration)
  }, [stepIdx, duration])

  // Step timer countdown
  const startTimer = useCallback(() => {
    if (timerSec === null || timerSec <= 0) return
    setTimerRunning(true)
    timerRef.current = setInterval(() => {
      setTimerSec(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!)
          setTimerRunning(false)
          setTimerDone(true)
          beep()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [timerSec])

  const pauseTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimerRunning(false)
  }, [])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimerRunning(false)
    setTimerDone(false)
    setTimerSec(duration)
  }, [duration])

  const goNext = () => {
    if (isLast) { router.push(`/recipe/${recipeId}?from=cook`) }
    else { setStepIdx(i => i + 1) }
  }
  const goPrev = () => { if (stepIdx > 0) setStepIdx(i => i - 1) }

  return (
    <div style={{
      background: 'var(--text)', minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      color: '#fff', padding: '0',
    }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 22px', flexShrink: 0,
      }}>
        <button
          onClick={() => router.push(`/recipe/${recipeId}`)}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0 }}
        >
          ✕
        </button>
        <span style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontFamily: 'Epilogue, sans-serif' }}>
          {t('mode_label')}
        </span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono, monospace' }}>
          {formatTime(elapsed)}
        </span>
      </div>

      {/* Step counter + progress bar */}
      <div style={{ padding: '0 22px 16px', flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontFamily: 'Epilogue, sans-serif', marginBottom: 8 }}>
          {t('step_of', { current: stepIdx + 1, total: steps.length })}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= stepIdx ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>
      </div>

      {/* Main instruction */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 22px 20px' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 28, lineHeight: 1.2, letterSpacing: '-0.02em', color: '#fff', marginBottom: 20 }}>
          {highlightStep(currentStep)}
        </h2>

        {/* Tip card */}
        {tip && tip !== currentStep && (
          <div style={{
            background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--r-xs)', padding: '10px 12px',
            display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: duration ? 12 : 0,
          }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
            <span style={{ fontSize: 11.5, color: '#D8D5C8', lineHeight: 1.5, fontFamily: 'Epilogue, sans-serif' }}>
              {tip}
            </span>
          </div>
        )}

        {/* Timer card */}
        {duration !== null && timerSec !== null && (
          <div style={{
            background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--r-card)', padding: '12px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            border: timerDone ? '1px solid var(--accent)' : '0.5px solid rgba(255,255,255,0.1)',
            transition: 'border-color 0.3s',
          }}>
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontFamily: 'Epilogue, sans-serif', marginBottom: 4 }}>
                {timerDone ? t('timer_done') : t('timer')}
              </div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 500, color: timerDone ? 'var(--accent-soft)' : '#fff', lineHeight: 1 }}>
                {formatTime(timerSec)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={resetTimer}
                style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ↺
              </button>
              <button
                onClick={timerRunning ? pauseTimer : startTimer}
                style={{ width: 40, height: 40, borderRadius: '50%', background: timerRunning ? 'rgba(255,255,255,0.15)' : 'var(--accent)', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {timerRunning ? '⏸' : '▶'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step navigation */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 22px 28px', borderTop: '0.5px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <button
          onClick={goPrev}
          disabled={stepIdx === 0}
          style={{
            flex: 1, padding: '14px', borderRadius: 'var(--r-pill)',
            background: 'none', border: '0.5px solid rgba(255,255,255,0.2)',
            color: stepIdx === 0 ? 'rgba(255,255,255,0.2)' : '#fff',
            fontSize: 13, fontWeight: 500, fontFamily: 'Epilogue, sans-serif',
            cursor: stepIdx === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {t('back')}
        </button>
        <button
          onClick={goNext}
          style={{
            flex: 1.5, padding: '14px', borderRadius: 'var(--r-pill)',
            background: 'var(--accent)', border: 'none',
            color: '#fff', fontSize: 13, fontWeight: 500,
            fontFamily: 'Epilogue, sans-serif', cursor: 'pointer',
          }}
        >
          {isLast ? t('finish') : t('next')}
        </button>
      </div>
    </div>
  )
}
