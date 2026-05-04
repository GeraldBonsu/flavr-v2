'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppHeader from '@/components/app/AppHeader'
import BottomNav from '@/components/app/BottomNav'
import { createClient } from '@/lib/supabase/client'
interface Profile {
  name?: string | null
  initials?: string | null
  email?: string | null
  goal?: string | null
  dietary_restrictions?: string[] | null
  cultural_preferences?: string[] | null
  intent?: string | null
  fitness_goal?: string | null
  subscription_tier?: string | null
  onboarding_completed_at?: string | null
}

export default function AccountClient({ profile, email }: { profile: Profile | null; email: string }) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = profile?.initials ?? (profile?.name ?? '??').slice(0, 2).toUpperCase()
  const name = profile?.name ?? 'You'

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <AppHeader initials={initials} />

      <div className="content-scroll" style={{ padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px', background: '#fff', borderRadius: 14, border: '0.5px solid rgba(0,0,0,0.08)' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green)', color: '#fff', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{email}</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 8, fontWeight: 600, background: 'var(--tag-bg)', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {profile?.subscription_tier ?? 'free'}
            </span>
          </div>
        </div>

        {/* Profile details */}
        <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-light)', marginBottom: 4 }}>Goal</div>
            <div style={{ fontSize: 11, color: 'var(--text)' }}>{profile?.goal ?? profile?.intent ?? 'Not set'}</div>
          </div>
          {profile?.dietary_restrictions && profile.dietary_restrictions.length > 0 && (
            <div style={{ padding: '10px 14px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-light)', marginBottom: 6 }}>Dietary restrictions</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {profile.dietary_restrictions.map(d => (
                  <span key={d} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 8, background: 'var(--tag-bg)', color: 'var(--green)' }}>{d}</span>
                ))}
              </div>
            </div>
          )}
          {profile?.cultural_preferences && profile.cultural_preferences.length > 0 && (
            <div style={{ padding: '10px 14px' }}>
              <div style={{ fontSize: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted-light)', marginBottom: 6 }}>Cuisine preferences</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {profile.cultural_preferences.map(c => (
                  <span key={c} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 8, background: 'var(--tag-bg)', color: 'var(--green)' }}>{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <Link href="/onboarding" style={{
          display: 'block', padding: '12px 14px', background: '#fff', borderRadius: 12,
          border: '0.5px solid rgba(0,0,0,0.08)', fontSize: 12, color: 'var(--text)',
          textDecoration: 'none', fontFamily: 'Epilogue, sans-serif',
        }}>
          ✏️ Update profile
        </Link>

        <button onClick={handleSignOut} style={{
          padding: '12px 14px', borderRadius: 12, background: '#fff',
          border: '0.5px solid rgba(184,74,30,0.25)', fontSize: 12, color: 'var(--accent)',
          cursor: 'pointer', textAlign: 'left', fontFamily: 'Epilogue, sans-serif',
        }}>
          Sign out
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
