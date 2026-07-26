'use client'

import { useToast } from '@/components/chrome/ToastProvider'

/** An affordance with no backend yet: it explains itself rather than failing silently. */
export function ToastButton({
  message,
  children,
  className = '',
}: {
  message: string
  children: React.ReactNode
  className?: string
}) {
  const toast = useToast()

  return (
    <button type="button" onClick={() => toast(message)} className={`cursor-pointer ${className}`}>
      {children}
    </button>
  )
}
