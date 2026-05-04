'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV_ITEMS = [
  {
    href: '/home',
    label: 'Cook',
    icon: (
      <svg className="nav-svg" viewBox="0 0 20 20">
        <path d="M3 9.5C3 5.36 6.13 2 10 2s7 3.36 7 7.5V18H3V9.5z"/>
        <path d="M10 2v3M6 18v-2M14 18v-2"/>
      </svg>
    ),
  },
  {
    href: '/saved',
    label: 'Saved',
    icon: (
      <svg className="nav-svg" viewBox="0 0 20 20">
        <path d="M5 2h10a1 1 0 011 1v15l-6-3-6 3V3a1 1 0 011-1z"/>
      </svg>
    ),
  },
  {
    href: '/plan',
    label: 'Plan',
    icon: (
      <svg className="nav-svg" viewBox="0 0 20 20">
        <rect x="2" y="4" width="16" height="14" rx="2"/>
        <path d="M6 2v4M14 2v4M2 9h16"/>
      </svg>
    ),
  },
  {
    href: '/learn',
    label: 'Learn',
    icon: (
      <svg className="nav-svg" viewBox="0 0 20 20">
        <path d="M10 2L2 6l8 4 8-4-8-4zM2 10l8 4 8-4M2 14l8 4 8-4"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`nav-item ${pathname === item.href ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          {item.icon}
          <span className="nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
