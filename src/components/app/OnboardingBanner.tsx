'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const DISMISSED_KEY = 'onboarding_dismissed'

export default function OnboardingBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (!dismissed) setVisible(true)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      background: 'var(--green-dark)',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      flexShrink: 0,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
          Complete your profile
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)' }}>
          Get personalised recipes tailored to your goals
        </div>
      </div>
      <Link
        href="/onboarding"
        style={{
          padding: '6px 12px', borderRadius: 8,
          background: 'var(--accent)', color: '#fff',
          fontSize: 9, fontWeight: 500,
          fontFamily: 'Epilogue, sans-serif',
          textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        Set up →
      </Link>
      <button
        onClick={dismiss}
        style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.35)', fontSize: 16,
          cursor: 'pointer', padding: 2, flexShrink: 0,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
