'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'

/** Shared bits for the public forms, so their fields look and behave alike. */

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

type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

/**
 * Holds every field's value in React state and drives the inputs from it.
 *
 * React empties a `<form action={…}>` once its action returns. That is right
 * for a submission that succeeded and wrong for one that came back rejected:
 * it throws away a finished abstract because an email address had a typo in it.
 * State survives that reset, so a rejected form comes back with everything
 * still in it and only the bad fields marked.
 *
 * It also gives the character counters something live to count.
 */
export function useFormFields<Name extends string>(names: readonly Name[]) {
  const [values, setValues] = useState<Record<Name, string>>(
    () => Object.fromEntries(names.map((name) => [name, ''])) as Record<Name, string>,
  )
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const formRef = useRef<HTMLFormElement>(null)

  /*
   * Puts the DOM back in step with state after React resets the form.
   *
   * React restores a controlled text input after the reset but not a
   * controlled <select> or checkbox: their value prop has not changed, so
   * there is nothing for React to re-apply, and the control silently falls
   * back to its first option or to unchecked. The form then looks filled in
   * while it would post something else.
   *
   * No dependency array on purpose. This runs after every render and only
   * writes where the two have actually drifted apart.
   */
  useEffect(() => {
    const form = formRef.current
    if (!form) return

    for (const [name, value] of Object.entries(values) as [Name, string][]) {
      const control = form.elements.namedItem(name)
      if (
        (control instanceof HTMLSelectElement ||
          control instanceof HTMLInputElement ||
          control instanceof HTMLTextAreaElement) &&
        control.value !== value
      ) {
        control.value = value
      }
    }

    for (const [name, isChecked] of Object.entries(checked)) {
      const control = form.elements.namedItem(name)
      if (control instanceof HTMLInputElement && control.checked !== isChecked) {
        control.checked = isChecked
      }
    }
  })

  /** Spread onto a text input, textarea, or select. */
  function field(name: Name) {
    return {
      name,
      value: values[name],
      onChange: (event: ChangeEvent<FieldElement>) =>
        setValues((current) => ({ ...current, [name]: event.target.value })),
    }
  }

  /** Spread onto a checkbox, which carries `checked` rather than a value. */
  function checkbox(name: string) {
    return {
      name,
      checked: checked[name] ?? false,
      onChange: (event: ChangeEvent<HTMLInputElement>) =>
        setChecked((current) => ({ ...current, [name]: event.target.checked })),
    }
  }

  /** Empties the form. For the rare one that stays on screen after it works. */
  function reset() {
    setValues((current) => {
      const cleared = { ...current }
      for (const name of Object.keys(cleared) as Name[]) cleared[name] = ''
      return cleared
    })
    setChecked({})
  }

  return { values, field, checkbox, formRef, reset }
}

/**
 * The running character count for a field that has a floor or a ceiling.
 *
 * Counts trimmed length, because that is what the server validates: a count
 * that included surrounding whitespace could read 40 while the form still
 * rejected the field for being too short.
 *
 * Below the minimum it stays quiet and reports the target, since someone part
 * way through typing has not made a mistake. Over the maximum it turns maroon,
 * because that submission will be rejected.
 */
export function CharCount({ value, min, max }: { value: string; min?: number; max: number }) {
  const length = value.trim().length
  const belowMinimum = min !== undefined && length < min
  const overMaximum = length > max

  return (
    <span
      className={`text-[11.5px] tabular-nums flex-none ${
        overMaximum ? 'text-maroon font-bold' : 'text-body-muted'
      }`}
    >
      {belowMinimum ? `${length} / ${min} minimum` : `${length} / ${max}`}
    </span>
  )
}

/** Label row for a field that carries a counter, so the count sits out right. */
export function LabelRow({ children }: { children: React.ReactNode }) {
  return <span className="flex items-baseline justify-between gap-3">{children}</span>
}
