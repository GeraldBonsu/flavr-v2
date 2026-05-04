'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/app/AppHeader'
import BottomNav from '@/components/app/BottomNav'

const FILTERS = ['All', 'Muscle gain', 'Weight loss', 'Balanced', 'Vegan', 'Halal']

interface RecipeSummary {
  id: string
  name: string
  emoji: string | null
  cuisine: string | null
  calories: number | null
  protein: string | null
  cook_time: string | null
  goal: string | null
  saved_at: string
}

export default function SavedClient({ recipes }: { recipes: RecipeSummary[] }) {
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = activeFilter === 'All'
    ? recipes
    : recipes.filter(r => r.goal?.toLowerCase() === activeFilter.toLowerCase())

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <AppHeader />

      <div className="content-scroll" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="serif" style={{ fontSize: 18, fontWeight: 400, color: 'var(--text)' }}>Saved recipes</div>

        <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 2 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{
              padding: '5px 11px', borderRadius: 20, fontSize: 8, fontWeight: 500,
              fontFamily: 'Epilogue, sans-serif',
              border: activeFilter === f ? 'none' : '0.5px solid rgba(0,0,0,0.1)',
              background: activeFilter === f ? 'var(--text)' : '#fff',
              color: activeFilter === f ? '#fff' : 'var(--muted)',
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            }}>{f}</button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📒</div>
            <div className="serif" style={{ fontSize: 18, color: 'var(--text)', marginBottom: 6 }}>No saved recipes</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>Generate a recipe to save it here</div>
            <Link href="/home" style={{
              display: 'inline-block', marginTop: 16, padding: '10px 20px',
              background: 'var(--accent)', color: '#fff', borderRadius: 10,
              fontSize: 11, fontWeight: 500, fontFamily: 'Epilogue, sans-serif', textDecoration: 'none',
            }}>
              Generate a recipe →
            </Link>
          </div>
        )}

        {filtered.map(r => (
          <Link key={r.id} href={`/recipe/${r.id}`} style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 11,
            display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px',
            cursor: 'pointer', textDecoration: 'none',
          }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>{r.emoji ?? '🍽'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{r.name}</div>
              <div style={{ fontSize: 8, color: 'var(--muted-light)', marginBottom: 5 }}>
                {r.calories} kcal · {r.protein} protein · {r.cook_time}
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {r.goal && (
                  <span style={{ padding: '2px 7px', borderRadius: 20, fontSize: 7, fontWeight: 500, background: 'var(--tag-bg)', color: 'var(--green)' }}>
                    {r.goal}
                  </span>
                )}
                {r.cuisine && (
                  <span style={{ padding: '2px 7px', borderRadius: 20, fontSize: 7, fontWeight: 500, background: 'var(--tag-bg)', color: 'var(--green)' }}>
                    {r.cuisine}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
