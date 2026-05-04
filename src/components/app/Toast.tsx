'use client'

import { useEffect, useState, createContext, useContext, useCallback } from 'react'

interface ToastCtx {
  showToast: (msg: string) => void
}

const ToastContext = createContext<ToastCtx>({ showToast: () => undefined })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg]         = useState('')
  const [visible, setVisible] = useState(false)

  const showToast = useCallback((message: string) => {
    setMsg(message)
    setVisible(true)
    setTimeout(() => setVisible(false), 2400)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={`toast ${visible ? 'show' : ''}`}>{msg}</div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
