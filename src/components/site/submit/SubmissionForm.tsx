'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useToast } from '@/components/chrome/ToastProvider'
import {
  CharCount,
  FIELD_LABEL as LABEL,
  FieldError,
  LabelRow,
  invalid,
  summarise,
  useFocusFirstError,
  useFormFields,
} from '@/components/ui/FieldError'
import type { FormResult } from '@/lib/form-result'
import { createManuscriptUpload, submitManuscript } from '@/lib/submissions/actions'
import {
  MAX_MANUSCRIPT_BYTES,
  manuscriptExtension,
  readableSize,
} from '@/lib/submissions/manuscript'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Discipline } from '@/lib/content'

const FIELDS = ['author', 'email', 'institution', 'section', 'title', 'abstract'] as const

const ERROR_LABELS: Record<string, string> = {
  correspondingAuthor: 'the corresponding author',
  email: 'the email address',
  institution: 'the institution',
  section: 'the section',
  title: 'the manuscript title',
  abstract: 'the abstract',
  originality: 'the originality confirmation',
  manuscript: 'the attached file',
}

/** The same checks the server runs, run early so a bad file is caught at once. */
function fileProblem(file: File): string | null {
  if (!manuscriptExtension(file.name, file.type)) return 'Only PDF and DOCX files are accepted.'
  if (file.size > MAX_MANUSCRIPT_BYTES) {
    return `That file is ${readableSize(file.size)}. The limit is 20 MB.`
  }
  return null
}

export function SubmissionForm({ disciplines }: { disciplines: Discipline[] }) {
  const toast = useToast()
  const fileInput = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const { values, field, checkbox, formRef } = useFormFields(FIELDS)

  /*
   * The action runs here in the browser rather than being the Server Action
   * itself, because the file has to go straight to storage: see the note at
   * the top of lib/submissions/actions.ts. Only text ever reaches the server.
   *
   * The chosen file is read from state, not from the form. React empties a
   * form once its action returns, which empties the file input with it; state
   * is what keeps the attachment through a rejected submission.
   */
  const [state, action, pending] = useActionState<FormResult | null, FormData>(
    async (_previous, form) => {
      const chosen = file

      // Everything except the file. The file is described, not carried.
      const fields = new FormData()
      for (const [key, value] of Array.from(form.entries())) {
        if (typeof value === 'string') fields.set(key, value)
      }
      if (chosen) {
        fields.set('manuscriptName', chosen.name)
        fields.set('manuscriptType', chosen.type)
        fields.set('manuscriptSize', String(chosen.size))
      }

      try {
        /*
         * The missing file is reported by the server along with the text, and
         * after it, so a form with three empty boxes and no attachment names
         * all four rather than only the attachment.
         */
        const target = await createManuscriptUpload(null, fields)
        if (!target.ok || !target.upload) return target
        if (!chosen) {
          return {
            ok: false,
            message: 'Please attach the anonymised manuscript.',
            fieldErrors: { manuscript: 'A PDF or DOCX file is required.' },
          }
        }

        setUploading(true)
        const supabase = createSupabaseBrowserClient()
        const { error } = await supabase.storage
          .from('manuscripts')
          .uploadToSignedUrl(target.upload.path, target.upload.token, chosen, {
            contentType: chosen.type || undefined,
          })

        if (error) {
          console.error('[submit] upload to storage failed:', error)
          return {
            ok: false,
            message: 'The upload did not finish. Please check your connection and try again.',
            fieldErrors: { manuscript: 'The file did not reach us.' },
          }
        }

        fields.set('manuscriptPath', target.upload.path)
        return await submitManuscript(null, fields)
      } finally {
        setUploading(false)
      }
    },
    null,
  )

  function chooseFile(chosen: File | null) {
    setFile(chosen)
    setFileError(chosen ? fileProblem(chosen) : null)
  }

  function clearFile() {
    // Resetting the input's value is what actually empties its FileList, so the
    // form posts no file. Clearing React state alone would only hide the chip.
    if (fileInput.current) fileInput.current.value = ''
    chooseFile(null)
  }

  useEffect(() => {
    if (!state?.message) return
    toast(summarise(state.fieldErrors ?? {}, ERROR_LABELS, state.message))
  }, [state, toast])

  const errors = state?.fieldErrors ?? {}
  useFocusFirstError(errors)

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
      ref={formRef}
      action={action}
      className="mt-[18px] border border-rule bg-cream px-[clamp(18px,3vw,32px)] py-[clamp(20px,3vw,30px)]"
    >
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-5">
        <label className="flex flex-col gap-[7px]">
          <span className={LABEL}>Corresponding author</span>
          <input
            placeholder="Full name"
            className="field"
            {...field('author')}
            {...invalid(errors, 'correspondingAuthor')}
          />
          <FieldError message={errors.correspondingAuthor} />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className={LABEL}>Email</span>
          <input
            type="email"
            placeholder="you@university.edu"
            className="field"
            {...field('email')}
            {...invalid(errors, 'email')}
          />
          <FieldError message={errors.email} />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className={LABEL}>Institution</span>
          <input
            placeholder="University or college"
            className="field"
            {...field('institution')}
            {...invalid(errors, 'institution')}
          />
          <FieldError message={errors.institution} />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className={LABEL}>Section</span>
          <select className="field" {...field('section')} {...invalid(errors, 'section')}>
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
        <input
          placeholder="Working title"
          className="field"
          {...field('title')}
          {...invalid(errors, 'title')}
        />
        <FieldError message={errors.title} />
      </label>

      <label className="flex flex-col gap-[7px] mt-5">
        <LabelRow>
          <span className={LABEL}>Abstract</span>
          <CharCount value={values.abstract} min={40} max={3000} />
        </LabelRow>
        <textarea
          rows={5}
          placeholder="State the question, method, and principal finding."
          className="field resize-y"
          {...field('abstract')}
          {...invalid(errors, 'abstract')}
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
          onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
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
            className="btn-base btn-outline mt-1 inline-block px-[22px] py-[10px] text-[11.5px]"
          >
            Choose file
          </label>
        )}

        {/* Rejected on sight, before anything is uploaded. */}
        <FieldError message={fileError ?? errors.manuscript} />
      </div>

      <label className="flex gap-[11px] items-start mt-5 text-[13.5px] leading-[1.7] text-body">
        <input type="checkbox" className="mt-[3px]" {...checkbox('originality')} />
        <span>
          I confirm the work is original, unpublished, not under consideration elsewhere, and that
          all authors have approved this submission.
        </span>
      </label>
      <FieldError message={errors.originality} />

      <button
        type="submit"
        disabled={pending || Boolean(fileError)}
        className="btn-base btn-maroon mt-[22px] px-[30px] py-[14px] text-[12px]"
      >
        {!pending ? 'Submit manuscript' : uploading ? 'Uploading…' : 'Sending…'}
      </button>
    </form>
  )
}
