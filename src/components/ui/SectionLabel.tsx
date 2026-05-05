interface Props {
  children: React.ReactNode
  color?: 'muted' | 'green' | 'accent' | 'white'
  className?: string
}

const colorMap = {
  muted:  'var(--muted)',
  green:  'var(--green)',
  accent: 'var(--accent)',
  white:  'rgba(255,255,255,0.6)',
}

export default function SectionLabel({ children, color = 'muted', className }: Props) {
  return (
    <span
      className={`section-label${className ? ` ${className}` : ''}`}
      style={{ color: colorMap[color] }}
    >
      {children}
    </span>
  )
}
