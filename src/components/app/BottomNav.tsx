'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

const NAV_HREFS = [
  {
    href: '/home',
    key: 'cook' as const,
    icon: (
      <svg className="nav-svg" viewBox="0 0 20 20">
        <path d="M10 2C7 2 4.5 4 4.5 6.5c0 1.5.7 2.8 1.8 3.7L5 18h10l-1.3-7.8c1.1-.9 1.8-2.2 1.8-3.7C15.5 4 13 2 10 2z"/>
        <path d="M10 2v3M7.5 3.5L9 5.5M12.5 3.5L11 5.5"/>
      </svg>
    ),
  },
  {
    href: '/saved',
    key: 'saved' as const,
    icon: (
      <svg className="nav-svg" viewBox="0 0 20 20">
        <path d="M5 2h10a1 1 0 011 1v15l-6-3-6 3V3a1 1 0 011-1z"/>
      </svg>
    ),
  },
  {
    href: '/plan',
    key: 'plan' as const,
    icon: (
      <svg className="nav-svg" viewBox="0 0 20 20">
        <rect x="2" y="4" width="16" height="14" rx="2"/>
        <path d="M6 2v4M14 2v4M2 9h16"/>
      </svg>
    ),
  },
  {
    href: '/learn',
    key: 'learn' as const,
    icon: (
      <svg className="nav-svg" viewBox="0 0 20 20">
        <path d="M10 2L2 6l8 4 8-4-8-4zM2 10l8 4 8-4M2 14l8 4 8-4"/>
      </svg>
    ),
  },
  {
    href: '/account',
    key: 'me' as const,
    icon: (
      <svg className="nav-svg" viewBox="0 0 20 20">
        <circle cx="10" cy="6" r="3.5"/>
        <path d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const t = useTranslations('nav')

  const isActive = (href: string) => {
    if (href === '/home') return pathname === '/home' || pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="bottom-nav">
      {NAV_HREFS.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
        >
          {item.icon}
          <span className="nav-label">{t(item.key)}</span>
        </Link>
      ))}
    </nav>
  )
}
