'use client'

import { useEffect } from 'react'

/** Shared bits for the public forms, so their fields look identical. */

export const FIELD_LABEL = 'text-[11.5px] tracking-[0.14em] uppercase font-bold text-body'

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <span className="text-[12.5px] text-maroon">{message}</span>
}

/**
 * Marks a rejected field so `.field[aria-invalid]` can highlight it, and so
 * screen readers announce it. Spread onto the input.
 */
export function invalid(errors: Record<string, string>, key: string) {
  return errors[key] ? ({ 'aria-invalid': true } as const) : {}
}

/**
 * Names the rejected fields instead of saying "check the highlighted fields",
 * which leaves someone hunting a long form for a hairline they cannot see.
 */
export function summarise(
  errors: Record<string, string>,
  labels: Record<string, string>,
  fallback: string,
): string {
  const names = Object.keys(errors).map((key) => labels[key] ?? key)
  if (names.length === 0) return fallback
  if (names.length === 1) return `Please check ${names[0]}.`
  return `Please check ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}.`
}

/**
 * Brings the first rejected field into view and focuses it.
 *
 * Without this a long form can reject a field that is scrolled off screen, and
 * the toast reads as if nothing happened.
 */
export function useFocusFirstError(errors: Record<string, string>) {
  const keys = Object.keys(errors).join(',')

  useEffect(() => {
    if (!keys) return
    const first = document.querySelector<HTMLElement>('[aria-invalid="true"]')
    if (!first) return
    first.scrollIntoView({ behavior: 'smooth', block: 'center' })
    first.focus({ preventScroll: true })
  }, [keys])
}
