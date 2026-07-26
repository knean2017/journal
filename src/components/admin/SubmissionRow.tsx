'use client'

import { useState } from 'react'
import { setSubmissionStatus, signManuscript } from '@/lib/admin/actions'

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'screening', label: 'Screening' },
  { value: 'under_review', label: 'Under review' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

export type Submission = {
  id: string
  title: string
  correspondingAuthor: string
  email: string
  institution: string
  abstract: string
  section: string
  status: string
  adminNotes: string
  manuscriptPath: string | null
  createdAt: string
}

export function SubmissionRow({ submission }: { submission: Submission }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(submission.status)
  const [notes, setNotes] = useState(submission.adminNotes)
  const [message, setMessage] = useState('')

  async function save() {
    setMessage('')
    try {
      await setSubmissionStatus(submission.id, status, notes)
      setMessage('Saved.')
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Could not save')
    }
  }

  async function download() {
    if (!submission.manuscriptPath) return
    setMessage('')
    try {
      // Signed for five minutes; manuscripts are never publicly readable.
      window.open(await signManuscript(submission.manuscriptPath), '_blank', 'noopener')
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Could not open the manuscript')
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
          <span className="font-serif text-[17px] text-ink">{submission.title}</span>
          <span className="text-[11.5px] tracking-[0.12em] uppercase font-bold text-gold-muted">
            {submission.status === 'new' ? 'New' : submission.status.replace('_', ' ')}
          </span>
        </div>
        <div className="mt-1 text-[13px] text-body-muted">
          {submission.correspondingAuthor} · {submission.institution} · {submission.section}
        </div>
      </button>

      {open ? (
        <div className="mt-4 bg-cream border border-rule p-5 grid gap-4 max-w-[720px]">
          <div className="text-[14px] leading-[1.75] text-body">{submission.abstract}</div>

          <div className="text-[13px] text-body-muted">
            <a href={`mailto:${submission.email}`}>{submission.email}</a>
          </div>

          <div className="flex gap-3 flex-wrap items-center">
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

            {submission.manuscriptPath ? (
              <button type="button" onClick={() => void download()} className="btn-base btn-outline">
                Open manuscript
              </button>
            ) : (
              <span className="text-[12.5px] text-body-muted">No file attached</span>
            )}
          </div>

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
