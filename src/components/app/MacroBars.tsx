'use client'

interface MacroItem {
  label: string
  consumed: number
  target: number
  color?: string
}

interface Props {
  items: MacroItem[]
}

export default function MacroBars({ items }: Props) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
      {items.map(item => {
        const ratio = item.target > 0 ? item.consumed / item.target : 0
        const clamped = Math.min(ratio, 1) * 100
        const over = ratio > 1
        return (
          <div key={item.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-light)' }}>
                {item.label}
              </span>
              <span style={{ fontSize: 9, color: over ? 'var(--accent)' : 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                {Math.round(item.consumed)}/{Math.round(item.target)}g
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${clamped}%`, borderRadius: 3,
                background: over ? 'var(--accent)' : (item.color ?? 'var(--green)'),
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
