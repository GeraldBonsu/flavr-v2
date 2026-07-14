'use client'

interface Option {
  value: string
  label: string
}

interface Props {
  options: Option[]
  value: string
  onChange: (value: string) => void
}

export default function SegmentedControl({ options, value, onChange }: Props) {
  return (
    <div style={{
      display: 'flex', gap: 4, padding: 4,
      background: 'var(--surface2)', borderRadius: 'var(--r-pill)',
    }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1, padding: '8px 10px', borderRadius: 'var(--r-pill)',
            border: 'none', cursor: 'pointer',
            background: value === opt.value ? '#fff' : 'transparent',
            color: value === opt.value ? 'var(--text)' : 'var(--muted)',
            fontWeight: value === opt.value ? 600 : 500,
            fontSize: 11.5, fontFamily: 'Epilogue, sans-serif',
            boxShadow: value === opt.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
