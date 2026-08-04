'use client'

import { useActionState, useState } from 'react'
import { sendAnnouncement } from '@/lib/announcements/actions'
import type { FormResult } from '@/lib/form-result'

export type SendableAnnouncement = {
  id: string
  title: string
  tag: string
  publishedOn: string
  alreadySent: boolean
}

/**
 * Choosing an announcement and mailing it.
 *
 * The confirmation step is a typed word rather than a checkbox or a second
 * click. An editor who has been clicking through the panel all afternoon
 * dismisses a dialog without reading it; typing SEND is short enough not to be
 * a chore and deliberate enough not to happen by accident. This is the only
 * control in the panel whose effect cannot be undone.
 */
export function SendAnnouncementForm({
  announcements,
  recipientCount,
}: {
  announcements: SendableAnnouncement[]
  recipientCount: number
}) {
  const [chosen, setChosen] = useState('')
  const [mode, setMode] = useState<'now' | 'later'>('now')
  const [typed, setTyped] = useState('')

  const [state, action, pending] = useActionState<FormResult | null, FormData>(
    sendAnnouncement,
    null,
  )

  const selected = announcements.find((item) => item.id === chosen)
  const armed = Boolean(selected) && typed.trim().toUpperCase() === 'SEND' && recipientCount > 0

  return (
    <form action={action} className="grid gap-5 max-w-[720px] mt-7">
      {state ? (
        <p
          role="alert"
          className={`m-0 border px-4 py-3 text-[14px] leading-[1.7] ${
            state.ok ? 'border-rule bg-cream text-body' : 'border-maroon bg-cream-tint text-maroon'
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <label className="grid gap-2">
        <span className="text-[13px] font-bold text-body">Announcement</span>
        <select
          name="announcementId"
          value={chosen}
          onChange={(event) => setChosen(event.target.value)}
          className="field"
        >
          <option value="">Choose one</option>
          {announcements.map((item) => (
            <option key={item.id} value={item.id} disabled={item.alreadySent}>
              {item.tag}: {item.title}
              {item.alreadySent ? ' (already sent)' : ''}
            </option>
          ))}
        </select>
        <span className="text-[13px] leading-[1.7] text-body-muted">
          Only published announcements appear here, and one that has gone out cannot be sent again.
        </span>
      </label>

      <fieldset className="grid gap-2 border-0 p-0 m-0">
        <legend className="text-[13px] font-bold text-body p-0">When</legend>

        <label className="flex items-center gap-2 text-[14px] text-body">
          <input
            type="radio"
            name="mode"
            checked={mode === 'now'}
            onChange={() => setMode('now')}
          />
          Send now
        </label>

        <label className="flex items-center gap-2 text-[14px] text-body">
          <input
            type="radio"
            name="mode"
            checked={mode === 'later'}
            onChange={() => setMode('later')}
          />
          Schedule it
        </label>

        {mode === 'later' ? (
          <>
            <input type="datetime-local" name="scheduledAt" className="field mt-1" required />
            <span className="text-[13px] leading-[1.7] text-body-muted">
              Held by the mail provider until then, up to 30 days ahead. Read in this browser&rsquo;s
              time zone.
            </span>
          </>
        ) : null}
      </fieldset>

      <label className="grid gap-2">
        <span className="text-[13px] font-bold text-body">
          Type SEND to confirm {recipientCount} {recipientCount === 1 ? 'recipient' : 'recipients'}
        </span>
        <input
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          className="field"
          placeholder="SEND"
          autoComplete="off"
        />
      </label>

      <div className="pt-1">
        <button type="submit" disabled={!armed || pending} className="btn-base btn-maroon">
          {pending
            ? 'Sending…'
            : mode === 'later'
              ? 'Schedule the announcement'
              : 'Send the announcement'}
        </button>
      </div>
    </form>
  )
}
