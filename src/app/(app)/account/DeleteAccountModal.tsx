'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

interface Props {
  onClose: () => void
}

export default function DeleteAccountModal({ onClose }: Props) {
  const router = useRouter()
  const t = useTranslations('account')
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(false)

  const canDelete = confirmText.trim().toUpperCase() === 'DELETE'

  const handleDelete = async () => {
    if (!canDelete) return
    setDeleting(true)
    setError(false)
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      if (!res.ok) throw new Error('delete failed')
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch {
      setError(true)
      setDeleting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 120,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 430,
        background: 'var(--bg)', borderRadius: '20px 20px 0 0',
        padding: '20px 20px calc(20px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div className="serif" style={{ fontSize: 20, fontWeight: 400, color: 'var(--accent)' }}>
            {t('delete_account_title')}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 16, color: 'var(--muted)', cursor: 'pointer', padding: 4 }}>✕</button>
        </div>

        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 18, fontFamily: 'Epilogue, sans-serif' }}>
          {t('delete_account_warning')}
        </p>

        <input
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          placeholder={t('delete_account_confirm_placeholder')}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 'var(--r-pill)',
            border: '0.5px solid var(--border-strong)', background: '#fff',
            fontSize: 13, fontFamily: 'Epilogue, sans-serif', color: 'var(--text)',
            outline: 'none', marginBottom: 14,
          }}
        />

        {error && (
          <p style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 12, fontFamily: 'Epilogue, sans-serif' }}>
            {t('delete_account_error')}
          </p>
        )}

        <button
          onClick={() => void handleDelete()}
          disabled={!canDelete || deleting}
          style={{
            width: '100%', padding: '14px', marginBottom: 8,
            background: canDelete ? 'var(--accent)' : 'rgba(184,74,30,0.35)',
            color: '#fff', border: 'none', borderRadius: 'var(--r-pill)',
            fontSize: 13, fontWeight: 500, fontFamily: 'Epilogue, sans-serif',
            cursor: canDelete && !deleting ? 'pointer' : 'not-allowed',
          }}
        >
          {deleting ? t('deleting_account') : t('delete_account_confirm_btn')}
        </button>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '12px',
            background: 'none', border: 'none',
            color: 'var(--muted)', fontSize: 12, fontFamily: 'Epilogue, sans-serif', cursor: 'pointer',
          }}
        >
          {t('delete_account_cancel')}
        </button>
      </div>
    </div>
  )
}
