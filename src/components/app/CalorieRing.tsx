'use client'

interface Props {
  consumed: number
  target: number
  mode: 'remaining' | 'consumed'
  targetCaption: string
  size?: number
  strokeWidth?: number
}

export default function CalorieRing({ consumed, target, mode, targetCaption, size = 116, strokeWidth = 10 }: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = target > 0 ? consumed / target : 0
  const clamped = Math.min(ratio, 1)
  const over = ratio > 1
  const offset = circumference * (1 - clamped)
  const remaining = target - consumed
  const displayValue = mode === 'consumed' ? Math.round(consumed) : Math.round(Math.abs(remaining))

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={over ? 'var(--accent)' : 'var(--green)'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: over && mode === 'remaining' ? 'var(--accent)' : 'var(--text)', lineHeight: 1 }}>
          {displayValue}
        </div>
        <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-light)', marginTop: 3 }}>
          kcal
        </div>
        <div style={{ fontSize: 7, color: 'var(--muted-light)', marginTop: 2 }}>
          {targetCaption}
        </div>
      </div>
    </div>
  )
}
