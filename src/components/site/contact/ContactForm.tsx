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
import { sendContactMessage } from '@/lib/inbox/actions'
import { CONTACT_TOPICS } from '@/lib/inbox/schema'

const ERROR_LABELS: Record<string, string> = {
  name: 'your name',
  email: 'the email address',
  topic: 'the topic',
  message: 'the message',
}

export function ContactForm() {
  const toast = useToast()
  const [state, action, pending] = useActionState<FormResult | null, FormData>(
    sendContactMessage,
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
      <div className="callout-gold px-[clamp(18px,3vw,32px)] py-[clamp(20px,3vw,30px)]">
        <h3 className="m-0 font-serif text-[21px] font-bold text-maroon">Message sent</h3>
        <p className="mt-[10px] mb-0 text-[15px] leading-[1.8] text-body">{state.message}</p>
      </div>
    )
  }

  return (
    <form
      action={action}
      className="border border-rule bg-cream px-[clamp(18px,3vw,32px)] py-[clamp(20px,3vw,30px)]"
    >
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-5">
        <label className="flex flex-col gap-[7px]">
          <span className={FIELD_LABEL}>Your name</span>
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
      </div>

      <label className="flex flex-col gap-[7px] mt-5">
        <span className={FIELD_LABEL}>Topic</span>
        <select name="topic" className="field" defaultValue="" {...invalid(errors, 'topic')}>
          <option value="" disabled>
            Choose a topic
          </option>
          {CONTACT_TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
        <FieldError message={errors.topic} />
      </label>

      <label className="flex flex-col gap-[7px] mt-5">
        <span className={FIELD_LABEL}>Message</span>
        <textarea
          name="message"
          rows={7}
          placeholder="Tell us what you need. If your message is about a manuscript already with us, include its title."
          className="field resize-y"
          {...invalid(errors, 'message')}
        />
        <FieldError message={errors.message} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="btn-base btn-maroon mt-[22px] px-[30px] py-[14px] text-[12px]"
      >
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
