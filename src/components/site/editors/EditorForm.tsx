'use client'

import { useActionState, useEffect } from 'react'
import { useToast } from '@/components/chrome/ToastProvider'
import {
  CharCount,
  FIELD_LABEL,
  FieldError,
  LabelRow,
  invalid,
  summarise,
  useFocusFirstError,
  useFormFields,
} from '@/components/ui/FieldError'
import type { FormResult } from '@/lib/form-result'
import { applyAsEditor } from '@/lib/inbox/actions'
import type { EditorialRole } from '@/lib/content'

const FIELDS = [
  'name',
  'email',
  'affiliation',
  'position',
  'role',
  'orcid',
  'statement',
  'experience',
] as const

const ERROR_LABELS: Record<string, string> = {
  name: 'your name',
  email: 'the email address',
  affiliation: 'the institution',
  position: 'the current position',
  role: 'the role',
  statement: 'the statement of interest',
  experience: 'the editorial experience',
  orcid: 'the ORCID',
}

export function EditorForm({ roles }: { roles: EditorialRole[] }) {
  const toast = useToast()
  const [state, action, pending] = useActionState<FormResult | null, FormData>(applyAsEditor, null)
  const { values, field, formRef } = useFormFields(FIELDS)

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
      ref={formRef}
      action={action}
      className="mt-[18px] border border-rule bg-cream px-[clamp(18px,3vw,32px)] py-[clamp(20px,3vw,30px)]"
    >
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-5">
        <label className="flex flex-col gap-[7px]">
          <span className={FIELD_LABEL}>Full name</span>
          <input
            placeholder="Full name"
            className="field"
            {...field('name')}
            {...invalid(errors, 'name')}
          />
          <FieldError message={errors.name} />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className={FIELD_LABEL}>Email</span>
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
          <span className={FIELD_LABEL}>Institution</span>
          <input
            placeholder="University or college"
            className="field"
            {...field('affiliation')}
            {...invalid(errors, 'affiliation')}
          />
          <FieldError message={errors.affiliation} />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className={FIELD_LABEL}>Current position</span>
          <input
            placeholder="PhD candidate, postdoc, lecturer"
            className="field"
            {...field('position')}
            {...invalid(errors, 'position')}
          />
          <FieldError message={errors.position} />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className={FIELD_LABEL}>Role you are applying for</span>
          <select className="field" {...field('role')} {...invalid(errors, 'role')}>
            <option value="" disabled>
              Choose a role
            </option>
            {roles.map((role) => (
              <option key={role.title} value={role.title}>
                {role.title}
              </option>
            ))}
          </select>
          <FieldError message={errors.role} />
        </label>
        <label className="flex flex-col gap-[7px]">
          <span className={FIELD_LABEL}>ORCID (optional)</span>
          <input
            placeholder="0000-0000-0000-0000"
            className="field"
            {...field('orcid')}
            {...invalid(errors, 'orcid')}
          />
          <FieldError message={errors.orcid} />
        </label>
      </div>

      <label className="flex flex-col gap-[7px] mt-5">
        <LabelRow>
          <span className={FIELD_LABEL}>Statement of interest</span>
          <CharCount value={values.statement} min={10} max={600} />
        </LabelRow>
        <textarea
          rows={3}
          placeholder="Why this role, and what you would bring to it."
          className="field resize-y"
          {...field('statement')}
          {...invalid(errors, 'statement')}
        />
        <FieldError message={errors.statement} />
      </label>

      <label className="flex flex-col gap-[7px] mt-5">
        <LabelRow>
          <span className={FIELD_LABEL}>Editorial experience (optional)</span>
          <CharCount value={values.experience} max={2000} />
        </LabelRow>
        <textarea
          rows={4}
          placeholder="Editorial boards, student journals, conference committees, or reviewing you have done. Newcomers are welcome; the founding editor works alongside a first appointment."
          className="field resize-y"
          {...field('experience')}
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
