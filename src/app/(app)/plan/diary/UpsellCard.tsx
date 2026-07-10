'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function UpsellCard() {
  const t = useTranslations('diary')

  return (
    <div style={{
      background: 'var(--green)', borderRadius: 'var(--r-card)',
      padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 6 }}>
          {t('premium_headline')}
        </div>
        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.75)', fontFamily: 'Epilogue, sans-serif', lineHeight: 1.6 }}>
          {t('premium_body')}
        </div>
      </div>
      <Link
        href="/subscription"
        style={{
          display: 'block', textAlign: 'center',
          padding: '13px', borderRadius: 'var(--r-pill)',
          background: 'var(--accent)', color: '#fff',
          fontSize: 13, fontWeight: 500, fontFamily: 'Epilogue, sans-serif',
          textDecoration: 'none',
        }}
      >
        {t('premium_cta')}
      </Link>
    </div>
  )
}
