'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

/**
 * Delete, on a list row, asking first.
 *
 * The two-step matches the one on the record editor: this is the only
 * irreversible control on these pages, and the rows it sits in are close
 * together, so a single click would be one mis-aim away from losing a
 * manuscript or an application.
 *
 * The action comes in as a prop rather than being imported here, because the
 * five callers delete five different things. A server component binds its ids
 * before passing it; a client component hands over a closure. Either way the
 * gate is inside the action, not in this component, which draws a button and
 * nothing more.
 */
export function DeleteButton({
  what,
  warning,
  onDelete,
}: {
  /** The noun in the question, lower case: "address", "submission". */
  what: string
  /** Replaces the default sentence where the consequence needs spelling out. */
  warning?: string
  onDelete: () => Promise<void>
}) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function remove() {
    setError('')
    startTransition(async () => {
      try {
        await onDelete()
        // The action revalidates; this is what redraws a list the browser is
        // already looking at without a full navigation.
        router.refresh()
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : `Could not delete the ${what}`)
        setConfirming(false)
      }
    })
  }

  if (!confirming) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-[11.5px] tracking-[0.14em] uppercase font-bold text-maroon bg-transparent border-0 p-0 cursor-pointer"
        >
          Delete this {what}
        </button>
        {error ? <span className="text-[12.5px] text-maroon">{error}</span> : null}
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <p className="m-0 text-[14px] leading-[1.7] text-maroon">
        {warning ?? `Delete this ${what} for good? It cannot be brought back.`}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={remove} disabled={pending} className="btn-base btn-maroon">
          {pending ? 'Deleting…' : 'Yes, delete it'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="text-[11.5px] tracking-[0.14em] uppercase font-bold bg-transparent border-0 p-0 cursor-pointer"
        >
          Keep it
        </button>
      </div>
    </div>
  )
}
