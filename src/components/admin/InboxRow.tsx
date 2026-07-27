'use client'

import { useState } from 'react'
import { setInboxStatus } from '@/lib/admin/actions'
import type { InboxKey } from '@/lib/admin/entities'

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
]

export type InboxItem = {
  id: string
  title: string
  subtitle: string
  email: string
  status: string
  adminNotes: string
  /** Rendered in order inside the opened panel. */
  details: { label: string; value: string }[]
}

export function InboxRow({ inbox, item }: { inbox: InboxKey; item: InboxItem }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(item.status)
  const [notes, setNotes] = useState(item.adminNotes)
  const [message, setMessage] = useState('')

  async function save() {
    setMessage('')
    try {
      await setInboxStatus(inbox, item.id, status, notes)
      setMessage('Saved.')
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Could not save')
    }
  }

  return (
    <div className="border-b border-rule py-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-full text-left bg-transparent border-0 p-0 cursor-pointer"
      >
        <div className="flex justify-between gap-5 items-baseline flex-wrap">
          <span className="font-serif text-[17px] text-ink">{item.title}</span>
          <span className="text-[11.5px] tracking-[0.12em] uppercase font-bold text-gold-muted">
            {STATUSES.find((option) => option.value === item.status)?.label ?? item.status}
          </span>
        </div>
        <div className="mt-1 text-[13px] text-body-muted">{item.subtitle}</div>
      </button>

      {open ? (
        <div className="mt-4 bg-cream border border-rule p-5 grid gap-4 max-w-[720px]">
          {item.details.map((detail) => (
            <div key={detail.label}>
              <div className="text-[11px] tracking-[0.16em] uppercase font-bold text-gold-muted">
                {detail.label}
              </div>
              <div className="mt-1 text-[14px] leading-[1.75] text-body whitespace-pre-wrap">
                {detail.value}
              </div>
            </div>
          ))}

          <div className="text-[13px] text-body-muted">
            <a href={`mailto:${item.email}`}>{item.email}</a>
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="field w-auto"
          >
            {STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="flex flex-col gap-[7px]">
            <span className="text-[11px] tracking-[0.16em] uppercase font-bold text-gold-muted">
              Editorial notes
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              className="field resize-y"
            />
          </label>

          <div className="flex gap-3 items-center">
            <button type="button" onClick={() => void save()} className="btn-base btn-maroon">
              Save
            </button>
            {message ? <span className="text-[12.5px] text-body-muted">{message}</span> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
