import Link from 'next/link'

export default function AppNotFound() {
  return (
    <div className="screen" style={{ background: 'var(--bg)', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
      <div className="logo" style={{ marginBottom: 20 }}>flavr<span className="logo-dot">.</span></div>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', textAlign: 'center', marginBottom: 20, fontFamily: 'Epilogue, sans-serif' }}>
        We couldn&apos;t find what you were looking for.
      </p>
      <Link
        href="/home"
        style={{ padding: '11px 20px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 500, fontFamily: 'Epilogue, sans-serif', textDecoration: 'none' }}
      >
        Back home
      </Link>
    </div>
  )
}
