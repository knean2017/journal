'use client'

import { useActionState } from 'react'
import { signIn } from '@/lib/admin/actions'

const LABEL = 'text-[11px] tracking-[0.16em] uppercase font-bold text-gold-muted'

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null)

  return (
    <form action={action} className="grid gap-4">
      <label className="flex flex-col gap-[7px]">
        <span className={LABEL}>Email</span>
        <input type="email" name="email" required autoComplete="username" className="field" />
      </label>

      <label className="flex flex-col gap-[7px]">
        <span className={LABEL}>Password</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="field"
        />
      </label>

      <button type="submit" disabled={pending} className="btn-base btn-maroon mt-2">
        {pending ? 'Checking…' : 'Sign in'}
      </button>

      {state?.error ? (
        <p role="alert" className="m-0 text-[13px] text-maroon">
          {state.error}
        </p>
      ) : null}
    </form>
  )
}
