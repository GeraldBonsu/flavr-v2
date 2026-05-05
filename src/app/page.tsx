import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/home')

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: 'var(--green-dark)', minHeight: '100vh',
      padding: '18px var(--gutter) 28px',
    }}>

      {/* Brand row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: 'Fraunces, serif', fontStyle: 'italic',
          fontWeight: 600, fontSize: 22, color: 'var(--accent)',
          letterSpacing: '-0.02em', lineHeight: 1,
        }}>
          flavr.
        </span>
        <span style={{
          fontSize: 10, color: 'rgba(255,255,255,0.55)',
          fontFamily: 'Epilogue, sans-serif',
        }}>
          v2
        </span>
      </div>

      {/* Hero — flex-grow, vertically centred */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 20 }}>
        <p style={{
          fontSize: 9.5, fontWeight: 500,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.6)',
          fontFamily: 'Epilogue, sans-serif', marginBottom: 14,
        }}>
          Cook with what you have
        </p>

        <h1 style={{
          fontFamily: 'Fraunces, serif', fontStyle: 'italic',
          fontWeight: 500, fontSize: 42,
          lineHeight: 0.98, letterSpacing: '-0.02em',
          color: '#fff', marginBottom: 18,
        }}>
          {"What's in "}
          <span style={{ color: 'var(--accent-soft)' }}>your</span>
          <br />
          <span style={{
            textDecoration: 'underline wavy rgba(232,150,116,0.35)',
            textUnderlineOffset: '8px',
          }}>
            kitchen?
          </span>
        </h1>

        <p style={{
          fontSize: 12.5, color: 'rgba(255,255,255,0.75)',
          lineHeight: 1.55, maxWidth: 280,
          fontFamily: 'Epilogue, sans-serif',
        }}>
          A recipe for whatever&apos;s in the fridge — tuned to your goals, your taste, your time.
        </p>
      </div>

      {/* Preview card */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '0.5px solid rgba(255,255,255,0.10)',
        borderRadius: 'var(--r-option)', padding: '12px 14px',
        marginBottom: 16,
      }}>
        <p style={{
          fontSize: 9.5, fontWeight: 500,
          letterSpacing: '0.088em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.55)',
          fontFamily: 'Epilogue, sans-serif', marginBottom: 6,
        }}>
          Tonight, from 6 ingredients
        </p>
        <p style={{
          fontFamily: 'Fraunces, serif', fontStyle: 'italic',
          fontSize: 15, color: '#fff', marginBottom: 5,
        }}>
          Charred halloumi &amp; chickpea bowl
        </p>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10.5, color: 'rgba(255,255,255,0.7)',
        }}>
          520 cal · 32g protein · 18 min
        </p>
      </div>

      {/* Primary CTA */}
      <Link
        href="/signup"
        style={{
          display: 'block', textAlign: 'center',
          padding: '15px', marginBottom: 14,
          background: 'var(--accent)', color: '#fff',
          borderRadius: 'var(--r-pill)',
          fontSize: 14, fontWeight: 500,
          fontFamily: 'Epilogue, sans-serif',
          letterSpacing: '0.01em', textDecoration: 'none',
        }}
      >
        Get started →
      </Link>

      {/* Sign-in link */}
      <p style={{
        textAlign: 'center', fontSize: 10.5,
        color: 'rgba(255,255,255,0.55)',
        fontFamily: 'Epilogue, sans-serif',
      }}>
        Already have an account?{' '}
        <Link
          href="/login"
          style={{ color: 'var(--accent-soft)', textDecoration: 'underline' }}
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
