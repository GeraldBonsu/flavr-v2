'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/onboarding')
      router.refresh()
    }
  }

  const handleGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    })
  }

  return (
    <div className="screen" style={{ background: '#1A3A0A' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 22px 28px' }}>
        <div className="logo" style={{ color: '#B84A1E', marginBottom: 32 }}>
          flavr<span style={{ color: '#6BCB8B' }}>.</span>
        </div>

        <div className="serif" style={{ fontSize: 26, fontWeight: 400, color: '#fff', marginBottom: 6, lineHeight: 1.2 }}>
          Create your account
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 32 }}>
          Start cooking smarter
        </div>

        {error && (
          <div style={{
            background: 'rgba(184,74,30,0.2)', border: '0.5px solid rgba(184,74,30,0.4)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            fontSize: 12, color: '#E8967A',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text" required value={name} onChange={e => setName(e.target.value)}
            placeholder="Your name"
            style={{
              padding: '13px 14px', borderRadius: 10,
              border: '0.5px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff', fontSize: 13, fontFamily: 'Epilogue, sans-serif', outline: 'none',
            }}
          />
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            style={{
              padding: '13px 14px', borderRadius: 10,
              border: '0.5px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff', fontSize: 13, fontFamily: 'Epilogue, sans-serif', outline: 'none',
            }}
          />
          <input
            type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            style={{
              padding: '13px 14px', borderRadius: 10,
              border: '0.5px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff', fontSize: 13, fontFamily: 'Epilogue, sans-serif', outline: 'none',
            }}
          />
          <button
            type="submit" disabled={loading}
            style={{
              padding: '13px', marginTop: 4,
              background: '#E5622A', color: '#fff', border: 'none', borderRadius: 12,
              fontSize: 12, fontWeight: 500, fontFamily: 'Epilogue, sans-serif',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating account…' : 'Get started →'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
          <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.12)' }} />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>OR</span>
          <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.12)' }} />
        </div>

        <button
          onClick={handleGoogle}
          style={{
            padding: '12px 14px', borderRadius: 12,
            border: '0.5px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.08)', color: '#fff',
            fontSize: 12, fontWeight: 500, fontFamily: 'Epilogue, sans-serif',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div style={{ marginTop: 'auto', paddingTop: 24, textAlign: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#E5622A', textDecoration: 'none' }}>Sign in</Link>
          </span>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.5 29.3 36 24 36a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 44 24c0-1.4-.2-2.7-.4-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.9-5.6l-6.4-5.4A12 12 0 0 1 24 36a12 12 0 0 1-11.3-7.9l-6.6 5A20 20 0 0 0 24 44z"/>
      <path fill="#1976D2" d="M43.6 20H24v8h11.3a12 12 0 0 1-4.7 5.9l6.4 5.4A20 20 0 0 0 44 24c0-1.4-.2-2.7-.4-4z"/>
    </svg>
  )
}
