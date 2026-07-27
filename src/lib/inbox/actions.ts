'use server'

import { headers } from 'next/headers'
import { contactMessageSchema, reviewerApplicationSchema } from './schema'
import { notify } from '@/lib/email/resend'
import { firstErrors, type FormResult } from '@/lib/form-result'
import { clientKey, rateLimit } from '@/lib/rate-limit'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

const OFFICE_EMAIL = process.env.EDITORIAL_EMAIL ?? 'icrrjournal@gmail.com'

/** Same honest fallback the submission form gives before the database exists. */
const noDatabase = (what: string): FormResult => ({
  ok: false,
  message: `${what} is not connected yet. Write to ${OFFICE_EMAIL} and we will answer.`,
})

export async function applyAsReviewer(
  _previous: FormResult | null,
  form: FormData,
): Promise<FormResult> {
  if (!isSupabaseConfigured()) return noDatabase('The reviewer panel form')

  const requestHeaders = await headers()
  if (!rateLimit(clientKey(requestHeaders, 'reviewer'), 3, 60 * 60 * 1000)) {
    return { ok: false, message: 'Too many applications from this address. Try again later.' }
  }

  const parsed = reviewerApplicationSchema.safeParse({
    name: form.get('name'),
    email: form.get('email'),
    affiliation: form.get('affiliation'),
    position: form.get('position'),
    section: form.get('section'),
    expertise: form.get('expertise'),
    experience: form.get('experience') ?? '',
    orcid: form.get('orcid') ?? '',
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: 'Please check the highlighted fields.',
      fieldErrors: firstErrors(parsed.error.issues),
    }
  }

  const supabase = createSupabaseServiceClient()

  const { data: discipline } = await supabase
    .from('disciplines')
    .select('id, name')
    .eq('slug', parsed.data.section)
    .maybeSingle()

  const { error } = await supabase.from('reviewer_applications').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    affiliation: parsed.data.affiliation,
    position: parsed.data.position,
    discipline_id: discipline?.id ?? null,
    expertise: parsed.data.expertise,
    experience: parsed.data.experience,
    orcid: parsed.data.orcid || null,
    status: 'new',
  })

  if (error) {
    console.error('[reviewer] insert failed:', error)
    return { ok: false, message: 'Something went wrong saving that. Please try again.' }
  }

  // The row is committed. Email is best effort from here.
  await notify(
    OFFICE_EMAIL,
    `Reviewer application: ${parsed.data.name}`,
    [
      `Name: ${parsed.data.name}`,
      `Email: ${parsed.data.email}`,
      `Institution: ${parsed.data.affiliation}`,
      `Position: ${parsed.data.position}`,
      `Section: ${discipline?.name ?? parsed.data.section}`,
      parsed.data.orcid ? `ORCID: ${parsed.data.orcid}` : '',
      '',
      'Areas of expertise:',
      parsed.data.expertise,
      '',
      'Review experience:',
      parsed.data.experience || 'Not given.',
    ]
      .filter(Boolean)
      .join('\n'),
  )

  return {
    ok: true,
    message: 'Application received. A section editor will be in touch about the next review cycle.',
  }
}

export async function sendContactMessage(
  _previous: FormResult | null,
  form: FormData,
): Promise<FormResult> {
  if (!isSupabaseConfigured()) return noDatabase('The contact form')

  const requestHeaders = await headers()
  if (!rateLimit(clientKey(requestHeaders, 'contact'), 5, 60 * 60 * 1000)) {
    return { ok: false, message: 'Too many messages from this address. Try again later.' }
  }

  const parsed = contactMessageSchema.safeParse({
    name: form.get('name'),
    email: form.get('email'),
    topic: form.get('topic'),
    message: form.get('message'),
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: 'Please check the highlighted fields.',
      fieldErrors: firstErrors(parsed.error.issues),
    }
  }

  const supabase = createSupabaseServiceClient()
  const { error } = await supabase.from('contact_messages').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    topic: parsed.data.topic,
    message: parsed.data.message,
    status: 'new',
  })

  if (error) {
    console.error('[contact] insert failed:', error)
    return { ok: false, message: 'Something went wrong sending that. Please try again.' }
  }

  await notify(
    OFFICE_EMAIL,
    `Enquiry: ${parsed.data.topic}`,
    [
      `From: ${parsed.data.name} <${parsed.data.email}>`,
      `Topic: ${parsed.data.topic}`,
      '',
      parsed.data.message,
    ].join('\n'),
  )

  return {
    ok: true,
    message: 'Message sent. The editorial office answers within five working days.',
  }
}
