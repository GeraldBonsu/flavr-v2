'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppHeader from '@/components/app/AppHeader'
import BottomNav from '@/components/app/BottomNav'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  name?: string | null
  initials?: string | null
  goal?: string | null
  dietary_restrictions?: string[] | null
  cultural_preferences?: string[] | null
  intent?: string | null
  fitness_goal?: string | null
  subscription_tier?: string | null
}

interface Stats { saved: number; cooked: number; streak: number }

const SETTINGS_ROWS = [
  { label: 'Update profile', href: '/onboarding' },
  { label: 'Pantry',         href: '/pantry' },
  { label: 'Subscription',   href: '#' },
  { label: 'Notifications',  href: '#' },
  { label: 'Help & feedback',href: '#' },
]

export default function AccountClient({
  profile,
  email,
  stats,
}: {
  profile: Profile | null
  email: string
  stats: Stats
}) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const name     = profile?.name ?? 'You'
  const initials = profile?.initials ?? name.slice(0, 2).toUpperCase()
  const isPro    = profile?.subscription_tier === 'premium'

  // Build profile tag list
  const goalLabel = profile?.fitness_goal
    ? { lose_weight: 'Lose weight', gain_muscle: 'Build muscle', maintain: 'Maintain', recomp: 'Recomp' }[profile.fitness_goal]
    : profile?.goal ?? profile?.intent ?? null
  const profileTags = [
    goalLabel ? `Goal · ${goalLabel}` : null,
    ...(profile?.dietary_restrictions ?? []),
    ...(profile?.cultural_preferences ?? []),
  ].filter(Boolean) as string[]

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <AppHeader initials={initials} />

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Profile card */}
        <div style={{
          background: 'var(--green)', borderRadius: 'var(--r-card)',
          padding: 16, display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: '#fff', color: 'var(--green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600,
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'Fraunces, serif', fontSize: 16,
              fontWeight: 500, color: '#fff',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {name}
            </div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
              {email}
            </div>
          </div>
          {isPro && (
            <div style={{
              padding: '3px 8px', borderRadius: 'var(--r-pill)',
              background: 'var(--accent)', color: '#fff',
              fontSize: 9.5, fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              flexShrink: 0,
            }}>
              PRO
            </div>
          )}
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          background: '#fff', borderRadius: 'var(--r-sm)',
          border: '0.5px solid var(--border)', overflow: 'hidden',
        }}>
          {[
            { val: stats.cooked, lbl: 'Cooked' },
            { val: stats.saved,  lbl: 'Saved' },
            { val: `${stats.streak}d`, lbl: 'Streak' },
          ].map((s, i) => (
            <div key={s.lbl} style={{
              padding: '12px 8px', textAlign: 'center',
              borderRight: i < 2 ? '0.5px solid var(--border)' : 'none',
            }}>
              <div style={{
                fontFamily: 'Fraunces, serif',
                fontSize: 18, fontWeight: 600, color: 'var(--text)', lineHeight: 1,
              }}>
                {s.val}
              </div>
              <div style={{
                fontSize: 9.5, textTransform: 'uppercase',
                letterSpacing: '0.07em', color: 'var(--muted)', marginTop: 4,
              }}>
                {s.lbl}
              </div>
            </div>
          ))}
        </div>

        {/* Profile tags */}
        <div>
          <div className="section-label" style={{ display: 'block', marginBottom: 8 }}>
            Your profile
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {profileTags.map(tag => (
              <span key={tag} style={{
                padding: '5px 12px', borderRadius: 'var(--r-pill)',
                border: '1px solid var(--green)',
                background: 'var(--tag-bg)', color: 'var(--green)',
                fontSize: 11.5, fontWeight: 500,
              }}>
                {tag}
              </span>
            ))}
            <Link href="/onboarding" style={{
              padding: '5px 12px', borderRadius: 'var(--r-pill)',
              border: '0.5px solid var(--border-strong)',
              background: '#fff', color: 'var(--muted-dark)',
              fontSize: 11.5, fontWeight: 500, textDecoration: 'none',
            }}>
              + edit
            </Link>
          </div>
        </div>

        {/* Settings list */}
        <div style={{
          background: '#fff', borderRadius: 'var(--r-option)',
          border: '0.5px solid var(--border)', overflow: 'hidden',
        }}>
          {SETTINGS_ROWS.map((row, i) => (
            <Link
              key={row.label}
              href={row.href}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 14px',
                borderBottom: i < SETTINGS_ROWS.length - 1 ? '0.5px solid var(--border)' : 'none',
                fontSize: 12.5, color: 'var(--text)',
                textDecoration: 'none', fontFamily: 'Epilogue, sans-serif',
              }}
            >
              {row.label}
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>›</span>
            </Link>
          ))}

          <button
            onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '13px 14px',
              background: 'none', border: 'none',
              fontSize: 12.5, color: 'var(--accent)',
              cursor: 'pointer', fontFamily: 'Epilogue, sans-serif',
              textAlign: 'left',
            }}
          >
            Sign out
            <span style={{ fontSize: 14 }}>›</span>
          </button>
        </div>

      </div>

      <BottomNav />
    </div>
  )
}
