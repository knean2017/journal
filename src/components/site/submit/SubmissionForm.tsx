'use client'

import { useActionState, useEffect, useState } from 'react'
import { useToast } from '@/components/chrome/ToastProvider'
import { submitManuscript, type FormResult } from '@/lib/submissions/actions'
import type { Discipline } from '@/lib/content'

const LABEL = 'text-[11.5px] tracking-[0.14em] uppercase font-bold text-body'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <span className="text-[12.5px] text-maroon">{message}</span>
}

export function SubmissionForm({ disciplines }: { disciplines: Discipline[] }) {
  const toast = useToast()
  const [state, action, pending] = useActionState<FormResult | null, FormData>(
    submitManuscript,
    null,
  )
  const [fileName, setFileName] = useState('')

  useEffect(() => {
    if (state?.message) toast(state.message)
  }, [state, toast])

  const errors = state?.fieldErrors ?? {}

  if (state?.ok) {
    return (
      <div className="mt-[18px] callout-gold px-[clamp(18px,3vw,32px)] py-[clamp(20px,3vw,30px)]">
        <h3 className="m-0 font-serif text-[21px] font-bold text-maroon">Submission received</h3>
        <p className="mt-[10px] mb-0 text-[15px] leading-[1.8] text-body">{state.message}</p>
      </div>
    )
  }

  return (
    <form
      action={action}
      className="mt-[18px] border border-rule bg-cream px-[clamp(18px,3vw,32px)] py-[clamp(20px,3vw,30px)]"
    >
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-5">
        <label className="flex flex-col gap-[7px]">
          <span className={LABEL}>Corresponding author</span>
          <input name="author" placeholder="Full name" className="field" />
          <FieldError message={errors.correspondingAuthor} />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className={LABEL}>Email</span>
          <input name="email" type="email" placeholder="you@university.edu" className="field" />
          <FieldError message={errors.email} />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className={LABEL}>Institution</span>
          <input name="institution" placeholder="University or college" className="field" />
          <FieldError message={errors.institution} />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className={LABEL}>Section</span>
          <select name="section" className="field" defaultValue="">
            <option value="" disabled>
              Choose a section
            </option>
            {disciplines.map((discipline) => (
              <option key={discipline.slug} value={discipline.slug}>
                {discipline.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.section} />
        </label>
      </div>

      <label className="flex flex-col gap-[7px] mt-5">
        <span className={LABEL}>Manuscript title</span>
        <input name="title" placeholder="Working title" className="field" />
        <FieldError message={errors.title} />
      </label>

      <label className="flex flex-col gap-[7px] mt-5">
        <span className={LABEL}>Abstract (250 words max)</span>
        <textarea
          name="abstract"
          rows={5}
          placeholder="State the question, method, and principal finding."
          className="field resize-y"
        />
        <FieldError message={errors.abstract} />
      </label>

      <div className="mt-5 border border-dashed border-gold bg-cream-tint p-[22px] text-center">
        <div className="font-serif text-[16px] text-maroon">Attach anonymised manuscript</div>
        <p className="mt-[6px] mb-2 text-[13px] text-body-muted">
          PDF or DOCX · max 20 MB · no author names in the file
        </p>
        <input
          type="file"
          name="manuscript"
          accept=".pdf,.docx"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')}
          className="text-[13px]"
        />
        {fileName ? <div className="mt-2 text-[12.5px] text-body">{fileName}</div> : null}
        <FieldError message={errors.manuscript} />
      </div>

      <label className="flex gap-[11px] items-start mt-5 text-[13.5px] leading-[1.7] text-body">
        <input type="checkbox" name="originality" className="mt-[3px]" />
        <span>
          I confirm the work is original, unpublished, not under consideration elsewhere, and that
          all authors have approved this submission.
        </span>
      </label>
      <FieldError message={errors.originality} />

      <button
        type="submit"
        disabled={pending}
        className="btn-base btn-maroon mt-[22px] px-[30px] py-[14px] text-[12px]"
      >
        {pending ? 'Sending…' : 'Submit manuscript'}
      </button>
    </form>
  )
}
