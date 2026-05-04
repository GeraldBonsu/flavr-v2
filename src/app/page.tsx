import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const features = [
  { icon: '🥗', title: 'Smart recipes', sub: 'From your fridge' },
  { icon: '📊', title: 'Nutrition AI',  sub: 'Accurate macros' },
  { icon: '🌍', title: 'World cuisine', sub: '200+ cultures' },
]

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/home')

  return (
    <div className="screen" style={{ background: '#1A3A0A' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 22px 28px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 10, fontFamily: 'Epilogue, sans-serif' }}>
          Welcome to
        </div>

        <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontStyle: 'italic', fontSize: 40, lineHeight: 1.1, color: '#fff', marginBottom: 8, letterSpacing: '-0.01em' }}>
          Your AI<br />kitchen<br />companion
        </div>

        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.48)', lineHeight: 1.6, marginBottom: 'auto', paddingBottom: 20 }}>
          Recipes from what you have.<br />Nutrition that fits your goals.
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {features.map(f => (
            <div key={f.title} style={{
              flex: 1, background: 'rgba(255,255,255,0.07)',
              border: '0.5px solid rgba(255,255,255,0.12)',
              borderRadius: 12, padding: '10px 8px',
            }}>
              <div style={{ fontSize: 18, marginBottom: 5 }}>{f.icon}</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{f.title}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.38)' }}>{f.sub}</div>
            </div>
          ))}
        </div>

        <Link
          href="/signup"
          style={{
            display: 'block', width: '100%', padding: '14px', textAlign: 'center',
            background: '#E5622A', color: '#fff', borderRadius: 12,
            fontSize: 12, fontWeight: 500, fontFamily: 'Epilogue, sans-serif',
            letterSpacing: '0.04em', textDecoration: 'none',
          }}
        >
          Get started →
        </Link>

        <Link
          href="/login"
          style={{
            display: 'block', textAlign: 'center',
            fontSize: 9, color: 'rgba(255,255,255,0.35)',
            marginTop: 12, textDecoration: 'none',
            fontFamily: 'Epilogue, sans-serif',
          }}
        >
          Already have an account? <span style={{ color: '#E5622A' }}>Sign in</span>
        </Link>
      </div>
    </div>
  )
}
