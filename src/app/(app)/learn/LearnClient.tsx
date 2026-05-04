'use client'

import { useState, useEffect, useRef } from 'react'
import AppHeader from '@/components/app/AppHeader'
import BottomNav from '@/components/app/BottomNav'
import { ToastProvider, useToast } from '@/components/app/Toast'
import { trackEvent } from '@/lib/analytics/client'

const POPULAR = ['Turmeric', 'Miso', 'Tahini', 'Cardamom', 'Mirin', 'Fenugreek', 'Sumac', 'Harissa']

interface IngredientInfo {
  name: string; category: string; region: string; origin: string
  cultural: string; benefits: string[]; globalRecipes: string[]
}

function LearnInner() {
  const { showToast } = useToast()
  const [query, setQuery]           = useState('')
  const [result, setResult]         = useState<IngredientInfo | null>(null)
  const [loading, setLoading]       = useState(false)
  const sessionStartRef = useRef(Date.now())

  useEffect(() => {
    void trackEvent('ingredient_library_opened')
    const handleLeave = () => {
      const duration = Math.round((Date.now() - sessionStartRef.current) / 1000)
      void trackEvent('ingredient_session_duration', { seconds: duration })
    }
    document.addEventListener('visibilitychange', handleLeave)
    window.addEventListener('pagehide', handleLeave)
    return () => {
      document.removeEventListener('visibilitychange', handleLeave)
      window.removeEventListener('pagehide', handleLeave)
    }
  }, [])

  const lookup = async (ingredient: string) => {
    if (!ingredient.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lookupIngredient', ingredient: ingredient.trim() }),
      })
      const data = await res.json() as IngredientInfo
      setResult(data)
      void trackEvent('ingredient_viewed', { ingredient_name: ingredient.trim() })
    } catch {
      showToast('Could not look up ingredient — try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <AppHeader />

      <div className="content-scroll" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="serif" style={{ fontSize: 18, fontWeight: 400, color: 'var(--text)' }}>Ingredient library</div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>Discover the history and nutrition behind any ingredient</div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && void lookup(query)}
            placeholder="Search any ingredient…"
            className="form-input"
            style={{ flex: 1 }}
          />
          <button onClick={() => void lookup(query)} disabled={loading || !query.trim()} style={{
            padding: '10px 14px', borderRadius: 10, background: 'var(--accent)', color: '#fff',
            border: 'none', fontSize: 11, fontWeight: 500, fontFamily: 'Epilogue, sans-serif',
            cursor: 'pointer', flexShrink: 0, opacity: loading || !query.trim() ? 0.6 : 1,
          }}>
            {loading ? '…' : 'Look up'}
          </button>
        </div>

        {/* Popular */}
        {!result && (
          <div>
            <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-light)', marginBottom: 8 }}>Popular</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {POPULAR.map(p => (
                <button key={p} onClick={() => { setQuery(p); void lookup(p) }} style={{
                  padding: '6px 12px', borderRadius: 20, fontSize: 10,
                  border: '0.5px solid rgba(0,0,0,0.12)', background: '#fff',
                  color: 'var(--muted)', cursor: 'pointer', fontFamily: 'Epilogue, sans-serif',
                }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: 'var(--green-dark)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 4 }}>
                {result.category} · {result.region}
              </div>
              <div className="serif" style={{ fontSize: 20, fontWeight: 400, color: '#fff', marginBottom: 8 }}>{result.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>{result.origin}</div>
            </div>

            <Section title="Cultural significance">
              <p style={{ fontSize: 10, color: 'var(--text)', lineHeight: 1.65 }}>{result.cultural}</p>
            </Section>

            <Section title="Nutritional benefits">
              {result.benefits.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '0.5px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', flexShrink: 0, marginTop: 4 }} />
                  <span style={{ fontSize: 10, color: 'var(--text)', lineHeight: 1.5 }}>{b}</span>
                </div>
              ))}
            </Section>

            <Section title="Found in world cuisine">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.globalRecipes.map((r, i) => (
                  <span key={i} style={{ padding: '4px 10px', borderRadius: 20, background: 'var(--tag-bg)', color: 'var(--green)', fontSize: 9, fontWeight: 500 }}>
                    {r}
                  </span>
                ))}
              </div>
            </Section>

            <button onClick={() => { setResult(null); setQuery('') }} style={{
              padding: '10px', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.12)',
              background: '#fff', fontSize: 11, color: 'var(--muted)',
              cursor: 'pointer', fontFamily: 'Epilogue, sans-serif',
            }}>
              Search another ingredient
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

export default function LearnClient() {
  return (
    <ToastProvider>
      <LearnInner />
    </ToastProvider>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', border: '0.5px solid rgba(0,0,0,0.08)' }}>
      <div className="sec-title" style={{ marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  )
}
