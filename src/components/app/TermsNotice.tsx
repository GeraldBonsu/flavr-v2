'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function TermsNotice() {
  const t = useTranslations('auth')

  const linkStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.7)', textDecoration: 'underline',
  }

  return (
    <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', marginBottom: 28, fontFamily: 'Epilogue, sans-serif' }}>
      {t('terms_prefix')}{' '}
      <Link href="/terms" style={linkStyle}>{t('terms_link')}</Link>
      {' & '}
      <Link href="/privacy" style={linkStyle}>{t('privacy_link')}</Link>.
    </p>
  )
}
