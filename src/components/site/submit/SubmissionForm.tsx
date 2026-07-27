'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useToast } from '@/components/chrome/ToastProvider'
import { FIELD_LABEL as LABEL, FieldError } from '@/components/ui/FieldError'
import type { FormResult } from '@/lib/form-result'
import { submitManuscript } from '@/lib/submissions/actions'
import type { Discipline } from '@/lib/content'

/** 4_100_000 -> "3.9 MB". Keeps the chip honest about what will be uploaded. */
function readableSize(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export function SubmissionForm({ disciplines }: { disciplines: Discipline[] }) {
  const toast = useToast()
  const [state, action, pending] = useActionState<FormResult | null, FormData>(
    submitManuscript,
    null,
  )
  const fileInput = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<{ name: string; size: number } | null>(null)

  function clearFile() {
    // Resetting the input's value is what actually empties its FileList, so the
    // form posts no file. Clearing React state alone would only hide the chip.
    if (fileInput.current) fileInput.current.value = ''
    setFile(null)
  }

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
          ref={fileInput}
          id="manuscript"
          type="file"
          name="manuscript"
          accept=".pdf,.docx"
          onChange={(event) => {
            const chosen = event.target.files?.[0]
            setFile(chosen ? { name: chosen.name, size: chosen.size } : null)
          }}
          className="sr-only"
        />

        {file ? (
          <div className="mt-3 inline-flex items-center gap-3 border border-rule bg-page px-3 py-2 text-left max-w-full">
            <span className="min-w-0 text-[13px] leading-[1.5]">
              <span className="block truncate text-ink">{file.name}</span>
              <span className="block text-[12px] text-body-muted">{readableSize(file.size)}</span>
            </span>
            <button
              type="button"
              onClick={clearFile}
              aria-label={`Remove ${file.name}`}
              title="Remove this file"
              className="flex-none border border-rule px-[9px] py-[3px] text-[13px] leading-none text-body hover:bg-cream hover:text-maroon"
            >
              ✕
            </button>
          </div>
        ) : (
          <label
            htmlFor="manuscript"
            className="btn-base btn-outline mt-1 inline-block cursor-pointer px-[22px] py-[10px] text-[11.5px]"
          >
            Choose file
          </label>
        )}

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
