'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const t = useTranslations('auth')

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)

    // Create user server-side — bypasses email confirmation entirely
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    const data = await res.json() as { success?: boolean; error?: string }

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    // Sign in to create a client-side session
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Account created — please sign in to continue.')
      setLoading(false)
      return
    }

    router.push('/onboarding')
    router.refresh()
  }

  const handleGoogle = async () => {
    setError(null)
    const supabase = createClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${appUrl}/auth/callback?next=/onboarding` },
    })
    if (error) setError(error.message)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    borderRadius: 'var(--r-pill)',
    border: '0.5px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff', fontSize: 13,
    fontFamily: 'Epilogue, sans-serif', outline: 'none',
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: 'var(--green-dark)', minHeight: '100vh',
      padding: '28px var(--gutter)',
    }}>

      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', marginBottom: 36, display: 'block' }}>
        <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 600, fontSize: 22, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
          flavr.
        </span>
      </Link>

      {/* Heading */}
      <h1 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 500, fontSize: 28, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 6 }}>
        {t('create_account')}
      </h1>
      <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', marginBottom: 28, fontFamily: 'Epilogue, sans-serif' }}>
        {t('terms')}
      </p>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(184,74,30,0.18)', border: '0.5px solid rgba(184,74,30,0.4)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12.5, color: 'var(--accent-soft)', fontFamily: 'Epilogue, sans-serif' }}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          type="text" required
          value={name} onChange={e => setName(e.target.value)}
          placeholder="Your name"
          style={inputStyle}
        />
        <input
          type="email" required
          value={email} onChange={e => setEmail(e.target.value)}
          placeholder={t('email')}
          style={inputStyle}
        />
        <input
          type="password" required minLength={6}
          value={password} onChange={e => setPassword(e.target.value)}
          placeholder={t('password')}
          style={inputStyle}
        />
        <button
          type="submit" disabled={loading}
          style={{
            marginTop: 6, padding: '14px',
            background: loading ? 'rgba(184,74,30,0.35)' : 'var(--accent)',
            color: '#fff', border: 'none', borderRadius: 'var(--r-pill)',
            fontSize: 14, fontWeight: 500, fontFamily: 'Epilogue, sans-serif',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? t('signing_up') : t('sign_up')}
        </button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
        <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.12)' }} />
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', fontFamily: 'Epilogue, sans-serif' }}>{t('or').toUpperCase()}</span>
        <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.12)' }} />
      </div>

      {/* Google */}
      <button
        onClick={handleGoogle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '13px 16px', border: '0.5px solid rgba(255,255,255,0.2)',
          borderRadius: 'var(--r-pill)', background: 'rgba(255,255,255,0.07)', color: '#fff',
          fontSize: 13, fontWeight: 500, fontFamily: 'Epilogue, sans-serif', cursor: 'pointer',
        }}
      >
        <GoogleIcon />
        {t('google')}
      </button>

      {/* Footer */}
      <p style={{ marginTop: 'auto', paddingTop: 28, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Epilogue, sans-serif' }}>
        {t('have_account')}{' '}
        <Link href="/login" style={{ color: 'var(--accent-soft)', textDecoration: 'underline' }}>
          {t('sign_in_link')}
        </Link>
      </p>
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
