'use client'

import { useActionState, useEffect } from 'react'
import { useToast } from '@/components/chrome/ToastProvider'
import {
  FIELD_LABEL,
  FieldError,
  invalid,
  summarise,
  useFocusFirstError,
} from '@/components/ui/FieldError'
import type { FormResult } from '@/lib/form-result'
import { applyAsReviewer } from '@/lib/inbox/actions'
import type { Discipline } from '@/lib/content'

const ERROR_LABELS: Record<string, string> = {
  name: 'your name',
  email: 'the email address',
  affiliation: 'the institution',
  position: 'the current position',
  section: 'the section',
  expertise: 'the areas of expertise',
  experience: 'the review experience',
  orcid: 'the ORCID',
}

export function ReviewerForm({ disciplines }: { disciplines: Discipline[] }) {
  const toast = useToast()
  const [state, action, pending] = useActionState<FormResult | null, FormData>(
    applyAsReviewer,
    null,
  )

  useEffect(() => {
    if (!state?.message) return
    toast(summarise(state.fieldErrors ?? {}, ERROR_LABELS, state.message))
  }, [state, toast])

  const errors = state?.fieldErrors ?? {}
  useFocusFirstError(errors)

  if (state?.ok) {
    return (
      <div className="mt-[18px] callout-gold px-[clamp(18px,3vw,32px)] py-[clamp(20px,3vw,30px)]">
        <h3 className="m-0 font-serif text-[21px] font-bold text-maroon">Application received</h3>
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
          <span className={FIELD_LABEL}>Full name</span>
          <input
            name="name"
            placeholder="Full name"
            className="field"
            {...invalid(errors, 'name')}
          />
          <FieldError message={errors.name} />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className={FIELD_LABEL}>Email</span>
          <input
            name="email"
            type="email"
            placeholder="you@university.edu"
            className="field"
            {...invalid(errors, 'email')}
          />
          <FieldError message={errors.email} />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className={FIELD_LABEL}>Institution</span>
          <input
            name="affiliation"
            placeholder="University or college"
            className="field"
            {...invalid(errors, 'affiliation')}
          />
          <FieldError message={errors.affiliation} />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className={FIELD_LABEL}>Current position</span>
          <input
            name="position"
            placeholder="PhD candidate, postdoc, lecturer"
            className="field"
            {...invalid(errors, 'position')}
          />
          <FieldError message={errors.position} />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className={FIELD_LABEL}>Section</span>
          <select name="section" className="field" defaultValue="" {...invalid(errors, 'section')}>
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
        <label className="flex flex-col gap-[7px]">
          <span className={FIELD_LABEL}>ORCID (optional)</span>
          <input
            name="orcid"
            placeholder="0000-0000-0000-0000"
            className="field"
            {...invalid(errors, 'orcid')}
          />
          <FieldError message={errors.orcid} />
        </label>
      </div>

      <label className="flex flex-col gap-[7px] mt-5">
        <span className={FIELD_LABEL}>Areas of expertise</span>
        <textarea
          name="expertise"
          rows={3}
          placeholder="The topics and methods you can assess confidently."
          className="field resize-y"
          {...invalid(errors, 'expertise')}
        />
        <FieldError message={errors.expertise} />
      </label>

      <label className="flex flex-col gap-[7px] mt-5">
        <span className={FIELD_LABEL}>Review experience (optional)</span>
        <textarea
          name="experience"
          rows={4}
          placeholder="Journals or conferences you have reviewed for, and anything else worth knowing. Newcomers are welcome; we pair first-time reviewers with an editor."
          className="field resize-y"
          {...invalid(errors, 'experience')}
        />
        <FieldError message={errors.experience} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="btn-base btn-maroon mt-[22px] px-[30px] py-[14px] text-[12px]"
      >
        {pending ? 'Sending…' : 'Send application'}
      </button>
    </form>
  )
}
