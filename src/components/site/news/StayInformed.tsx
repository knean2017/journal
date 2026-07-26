'use client'

import { useState } from 'react'
import { useToast } from '@/components/chrome/ToastProvider'
import { SUBSCRIBE_TOAST } from '@/lib/toasts'

export function StayInformed() {
  const toast = useToast()
  const [email, setEmail] = useState('')

  return (
    <aside className="border border-rule bg-cream px-[22px] py-6 sticky top-[70px] w-full max-w-[380px] justify-self-start">
      <div className="text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
        Stay informed
      </div>
      <p className="mt-[10px] mb-0 text-[14px] leading-[1.75] text-body">
        Get issue announcements by email, one message a month at most.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          // TODO(plan-3): replace with the real server action.
          toast(SUBSCRIBE_TOAST)
          setEmail('')
        }}
      >
        <input
          type="email"
          aria-label="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@university.edu"
          className="field mt-[14px] text-[14px]"
        />
        <button
          type="submit"
          className="btn-base btn-maroon block w-full text-center mt-[10px] py-3"
        >
          Subscribe
        </button>
      </form>
    </aside>
  )
}
