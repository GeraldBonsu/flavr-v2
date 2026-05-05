'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/app/BottomNav'
import { createClient } from '@/lib/supabase/client'

interface NotifPrefs {
  weekly_recipes: boolean
  pantry_reminders: boolean
  cooking_tips: boolean
  meal_plan: boolean
}

interface Props {
  userId: string
  initialPrefs: NotifPrefs
}

const NOTIFICATION_ROWS: { key: keyof NotifPrefs; label: string; description: string }[] = [
  {
    key: 'weekly_recipes',
    label: 'Weekly recipe ideas',
    description: 'A curated selection of recipes based on your goals every week.',
  },
  {
    key: 'pantry_reminders',
    label: 'Pantry expiry reminders',
    description: 'Alerts when fridge items in your pantry are getting old.',
  },
  {
    key: 'cooking_tips',
    label: 'Cooking tips',
    description: 'Quick techniques and flavour tips delivered periodically.',
  },
  {
    key: 'meal_plan',
    label: 'Meal plan updates',
    description: 'Reminders to review and update your weekly meal plan.',
  },
]

export default function NotificationsClient({ userId, initialPrefs }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [prefs, setPrefs] = useState<NotifPrefs>(initialPrefs)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function toggle(key: keyof NotifPrefs) {
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefs(updated)
    setSaving(true)
    setSaved(false)
    await supabase
      .from('profiles')
      .update({ notification_preferences: updated })
      .eq('id', userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 22px', flexShrink: 0,
        borderBottom: '0.5px solid var(--border)',
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: 20,
            padding: '4px 12px', fontSize: 9, color: 'var(--muted)',
            fontFamily: 'Epilogue, sans-serif', cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', fontFamily: 'Epilogue, sans-serif' }}>
          Notifications
        </span>
        <div style={{ width: 52, display: 'flex', justifyContent: 'flex-end' }}>
          {saving && (
            <span style={{ fontSize: 9, color: 'var(--muted)', fontFamily: 'Epilogue, sans-serif' }}>Saving…</span>
          )}
          {saved && !saving && (
            <span style={{ fontSize: 9, color: 'var(--green)', fontFamily: 'Epilogue, sans-serif' }}>Saved ✓</span>
          )}
        </div>
      </div>

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        <p style={{
          fontSize: 12, color: 'var(--muted)', fontFamily: 'Epilogue, sans-serif',
          lineHeight: 1.6, margin: 0,
        }}>
          Choose what you&apos;d like to hear from us. Changes save automatically.
        </p>

        {/* Toggle rows */}
        <div style={{
          background: '#fff', borderRadius: 'var(--r-card)',
          border: '0.5px solid var(--border)', overflow: 'hidden',
        }}>
          {NOTIFICATION_ROWS.map((row, i) => (
            <div
              key={row.key}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 14px',
                borderBottom: i < NOTIFICATION_ROWS.length - 1 ? '0.5px solid var(--border)' : 'none',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 13, fontWeight: 500, color: 'var(--text)',
                  fontFamily: 'Epilogue, sans-serif', marginBottom: 2,
                }}>
                  {row.label}
                </div>
                <div style={{
                  fontSize: 10.5, color: 'var(--muted)', fontFamily: 'Epilogue, sans-serif',
                  lineHeight: 1.5,
                }}>
                  {row.description}
                </div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => void toggle(row.key)}
                role="switch"
                aria-checked={prefs[row.key]}
                style={{
                  width: 44, height: 24, borderRadius: 12, flexShrink: 0,
                  background: prefs[row.key] ? 'var(--green)' : 'rgba(0,0,0,0.12)',
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: 3,
                  left: prefs[row.key] ? 23 : 3,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                  display: 'block',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
          ))}
        </div>

        {/* Info note */}
        <div style={{
          background: 'var(--tag-bg)', borderRadius: 'var(--r-xs)',
          padding: '12px 14px', border: '1px solid var(--green)',
        }}>
          <div style={{
            fontSize: 9, fontWeight: 600, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--green)',
            fontFamily: 'Epilogue, sans-serif', marginBottom: 4,
          }}>
            Note
          </div>
          <p style={{
            fontSize: 11, color: 'var(--text)', fontFamily: 'Epilogue, sans-serif',
            lineHeight: 1.6, margin: 0,
          }}>
            Push notifications are coming soon. For now, preferences are saved and will apply when the feature launches.
          </p>
        </div>

      </div>

      <BottomNav />
    </div>
  )
}
