'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="screen" style={{ background: 'var(--bg)', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
      <div className="logo" style={{ marginBottom: 20 }}>flavr<span className="logo-dot">.</span></div>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center', marginBottom: 20, fontFamily: 'Epilogue, sans-serif' }}>
        Something went wrong. Please try again.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={reset}
          style={{ padding: '11px 20px', borderRadius: 999, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 500, fontFamily: 'Epilogue, sans-serif', cursor: 'pointer' }}
        >
          Try again
        </button>
        <Link
          href="/home"
          style={{ padding: '11px 20px', borderRadius: 999, background: 'var(--surface2)', color: 'var(--text)', fontSize: 12, fontWeight: 500, fontFamily: 'Epilogue, sans-serif', textDecoration: 'none' }}
        >
          Back home
        </Link>
      </div>
    </div>
  )
}
