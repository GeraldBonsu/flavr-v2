'use client'

import Link from 'next/link'

interface Props {
  initials?: string
  showAvatar?: boolean
}

export default function AppHeader({ initials = 'ME', showAvatar = true }: Props) {
  return (
    <div className="app-header">
      <div className="logo">flavr<span className="logo-dot">.</span></div>
      {showAvatar && (
        <Link href="/account" style={{ textDecoration: 'none' }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--green)', color: 'white',
            fontSize: 9, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            letterSpacing: '0.03em',
          }}>
            {initials}
          </div>
        </Link>
      )}
    </div>
  )
}
