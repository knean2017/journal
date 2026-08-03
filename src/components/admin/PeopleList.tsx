'use client'

import { useActionState, useState, useTransition } from 'react'
import { invitePerson, setPersonActive, setPersonRole, type StaffMember } from '@/lib/admin/people'
import { ROLE_LABELS, STAFF_ROLES } from '@/lib/admin/permissions'
import type { InviteResult } from '@/lib/admin/people'

function Row({ person, isSelf }: { person: StaffMember; isSelf: boolean }) {
  const [role, setRole] = useState(person.role)
  const [active, setActive] = useState(person.isActive)
  const [message, setMessage] = useState('')
  const [pending, start] = useTransition()

  /*
   * Optimistic local state is reverted on failure rather than left showing a
   * value the server refused. The refusals here are real rules, not glitches:
   * the last administrator, and yourself.
   */
  function changeRole(next: string) {
    const previous = role
    setRole(next as StaffMember['role'])
    setMessage('')

    start(async () => {
      try {
        await setPersonRole(person.userId, next)
        setMessage('Saved.')
      } catch (cause) {
        setRole(previous)
        setMessage(cause instanceof Error ? cause.message : 'Could not change the role')
      }
    })
  }

  function changeActive(next: boolean) {
    const previous = active
    setActive(next)
    setMessage('')

    start(async () => {
      try {
        await setPersonActive(person.userId, next)
        setMessage(next ? 'Access restored.' : 'Access removed.')
      } catch (cause) {
        setActive(previous)
        setMessage(cause instanceof Error ? cause.message : 'Could not update access')
      }
    })
  }

  return (
    <div className="border-b border-rule py-4 flex flex-wrap gap-4 items-center">
      <div className="min-w-0 flex-1">
        <div className="font-serif text-[16.5px] text-ink truncate">
          {person.name || person.email}
          {isSelf ? <span className="text-body-muted"> · you</span> : null}
        </div>
        <div className="mt-1 text-[13px] text-body-muted truncate">
          {person.name ? `${person.email} · ` : ''}
          {active ? 'Active' : 'No access'}
        </div>
        {message ? <div className="mt-1 text-[12.5px] text-maroon">{message}</div> : null}
      </div>

      <label className="sr-only" htmlFor={`role-${person.userId}`}>
        Role for {person.email}
      </label>
      <select
        id={`role-${person.userId}`}
        value={role}
        disabled={isSelf || pending}
        onChange={(event) => changeRole(event.target.value)}
        className="flex-none border border-rule bg-page px-3 py-[8px] text-[13px] text-ink disabled:opacity-50"
      >
        {STAFF_ROLES.map((option) => (
          <option key={option} value={option}>
            {ROLE_LABELS[option]}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={isSelf || pending}
        onClick={() => changeActive(!active)}
        className="btn-base btn-outline flex-none disabled:opacity-50"
      >
        {active ? 'Remove access' : 'Restore access'}
      </button>
    </div>
  )
}

export function PeopleList({ staff, selfId }: { staff: StaffMember[]; selfId: string }) {
  const [state, action, pending] = useActionState<InviteResult | null, FormData>(invitePerson, null)

  return (
    <>
      <form action={action} className="grid gap-4 max-w-[620px] border border-rule p-6 bg-cream">
        <h2 className="m-0 font-serif text-[19px] font-bold">Invite somebody</h2>

        {state ? (
          <div
            role="alert"
            className={`border px-4 py-3 text-[14px] leading-[1.7] ${
              state.ok ? 'border-rule bg-page text-body' : 'border-maroon bg-cream-tint text-maroon'
            }`}
          >
            <p className="m-0">{state.message}</p>
            {state.link ? (
              <input
                readOnly
                value={state.link}
                onFocus={(event) => event.currentTarget.select()}
                className="mt-3 w-full border border-rule bg-page px-2 py-2 text-[12px] text-ink"
              />
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-1">
          <label htmlFor="invite-email" className="text-[13px] font-bold text-ink">
            Email
          </label>
          <input
            id="invite-email"
            name="email"
            type="email"
            required
            className="border border-rule bg-page px-3 py-[9px] text-[14px] text-ink"
          />
          {state?.fieldErrors?.email ? (
            <span className="text-[12.5px] text-maroon">{state.fieldErrors.email}</span>
          ) : null}
        </div>

        <div className="grid gap-1">
          <label htmlFor="invite-name" className="text-[13px] font-bold text-ink">
            Name <span className="font-normal text-body-muted">(optional)</span>
          </label>
          <input
            id="invite-name"
            name="name"
            type="text"
            className="border border-rule bg-page px-3 py-[9px] text-[14px] text-ink"
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="invite-role" className="text-[13px] font-bold text-ink">
            Role
          </label>
          <select
            id="invite-role"
            name="role"
            defaultValue="observer"
            className="border border-rule bg-page px-3 py-[9px] text-[14px] text-ink"
          >
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
          {state?.fieldErrors?.role ? (
            <span className="text-[12.5px] text-maroon">{state.fieldErrors.role}</span>
          ) : null}
        </div>

        <div>
          <button type="submit" disabled={pending} className="btn-base btn-maroon">
            {pending ? 'Inviting…' : 'Send invite'}
          </button>
        </div>
      </form>

      <div className="mt-10">
        <h2 className="m-0 font-serif text-[19px] font-bold">
          Who has access <span className="text-body-muted font-normal">({staff.length})</span>
        </h2>

        <div className="mt-4 border-t border-rule">
          {staff.length === 0 ? (
            <p className="py-6 m-0 text-[14px] text-body-muted">
              Nobody yet. Invite the first person above.
            </p>
          ) : (
            staff.map((person) => (
              <Row key={person.userId} person={person} isSelf={person.userId === selfId} />
            ))
          )}
        </div>

        <p className="mt-4 mb-0 text-[13px] leading-[1.7] text-body-muted">
          You cannot change your own role or remove your own access. That is what stops an
          administrator locking themselves out of the panel.
        </p>
      </div>
    </>
  )
}
