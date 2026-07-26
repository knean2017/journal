'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const TOAST_MS = 3600

const ToastContext = createContext<(message: string) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('')
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((next: string) => {
    if (timeout.current) clearTimeout(timeout.current)
    setMessage(next)
    timeout.current = setTimeout(() => setMessage(''), TOAST_MS)
  }, [])

  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current)
    },
    [],
  )

  return (
    <ToastContext.Provider value={show}>
      {children}
      {message ? (
        <div
          role="status"
          className="toast fixed left-1/2 bottom-[30px] -translate-x-1/2 z-[80] bg-ink text-cream px-6 py-[14px] text-[14px] text-center max-w-[min(560px,90vw)]"
          style={{ animation: 'icrrUp .3s ease both' }}
        >
          {message}
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}
