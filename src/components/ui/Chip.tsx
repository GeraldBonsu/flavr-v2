'use client'

interface Props {
  children: React.ReactNode
  variant?: 'tag' | 'outline' | 'dark'
  selected?: boolean
  onRemove?: () => void
  onClick?: () => void
  size?: 'sm' | 'md'
}

export default function Chip({
  children,
  variant = 'outline',
  selected = false,
  onRemove,
  onClick,
  size = 'md',
}: Props) {
  const isTag = variant === 'tag' || selected
  const isDark = variant === 'dark'

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 'var(--r-pill)',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: 500,
    cursor: onClick || onRemove ? 'pointer' : 'default',
    transition: 'transform 0.1s, opacity 0.1s',
    whiteSpace: 'nowrap',
  }

  const sizeStyles: React.CSSProperties = size === 'sm'
    ? { padding: '4px 10px', fontSize: 10.5 }
    : { padding: '5px 12px 5px 10px', fontSize: 11.5 }

  const variantStyles: React.CSSProperties = isDark
    ? { background: 'var(--green)', color: '#fff', border: '1.5px solid var(--green)' }
    : isTag
    ? { background: 'var(--tag-bg)', color: 'var(--green)', border: '1.5px solid var(--green)' }
    : { background: '#fff', color: 'var(--muted-dark)', border: '0.5px solid var(--border-strong)' }

  return (
    <span
      style={{ ...base, ...sizeStyles, ...variantStyles }}
      onClick={onClick}
    >
      {children}
      {onRemove && (
        <span
          onClick={e => { e.stopPropagation(); onRemove() }}
          style={{ opacity: 0.45, fontSize: 11, lineHeight: 1, cursor: 'pointer', paddingLeft: 2 }}
        >
          ×
        </span>
      )}
    </span>
  )
}
