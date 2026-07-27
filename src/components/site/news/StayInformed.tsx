'use client'

import { useActionState, useEffect } from 'react'
import { useToast } from '@/components/chrome/ToastProvider'
import type { FormResult } from '@/lib/form-result'
import { subscribe } from '@/lib/submissions/actions'

export function StayInformed() {
  const toast = useToast()
  const [state, action, pending] = useActionState<FormResult | null, FormData>(subscribe, null)

  useEffect(() => {
    if (state?.message) toast(state.message)
  }, [state, toast])

  return (
    <aside className="border border-rule bg-cream px-[22px] py-6 sticky top-[70px] w-full max-w-[380px] justify-self-start">
      <div className="text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
        Stay informed
      </div>
      <p className="mt-[10px] mb-0 text-[14px] leading-[1.75] text-body">
        Get issue announcements by email, one message a month at most.
      </p>

      <form action={action}>
        <input
          type="email"
          name="email"
          aria-label="Email address"
          placeholder="you@university.edu"
          className="field mt-[14px] text-[14px]"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn-base btn-maroon block w-full text-center mt-[10px] py-3"
        >
          {pending ? 'Adding…' : 'Subscribe'}
        </button>
      </form>
    </aside>
  )
}
