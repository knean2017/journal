'use server'

import { headers } from 'next/headers'
import { contactMessageSchema, editorApplicationSchema, reviewerApplicationSchema } from './schema'
import { notify } from '@/lib/email/resend'
import { firstErrors, text, type FormResult } from '@/lib/form-result'
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

  const parsed = reviewerApplicationSchema.safeParse({
    name: text(form, 'name'),
    email: text(form, 'email'),
    affiliation: text(form, 'affiliation'),
    position: text(form, 'position'),
    section: text(form, 'section'),
    expertise: text(form, 'expertise'),
    experience: text(form, 'experience'),
    orcid: text(form, 'orcid'),
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: 'Please check the highlighted fields.',
      fieldErrors: firstErrors(parsed.error.issues),
    }
  }

  /*
   * Rate limited here, after validation rather than before it. The limiter
   * guards the expensive path: upload, insert, and email. Counting rejected
   * attempts would lock someone out of the form for an hour for mistyping.
   */
  const requestHeaders = await headers()
  if (!rateLimit(clientKey(requestHeaders, 'reviewer'), 3, 60 * 60 * 1000)) {
    return { ok: false, message: 'Too many applications from this address. Try again later.' }
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

export async function applyAsEditor(
  _previous: FormResult | null,
  form: FormData,
): Promise<FormResult> {
  if (!isSupabaseConfigured()) return noDatabase('The editorial board form')

  const parsed = editorApplicationSchema.safeParse({
    name: text(form, 'name'),
    email: text(form, 'email'),
    affiliation: text(form, 'affiliation'),
    position: text(form, 'position'),
    role: text(form, 'role'),
    statement: text(form, 'statement'),
    experience: text(form, 'experience'),
    orcid: text(form, 'orcid'),
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: 'Please check the highlighted fields.',
      fieldErrors: firstErrors(parsed.error.issues),
    }
  }

  /*
   * Rate limited here, after validation rather than before it. The limiter
   * guards the expensive path: upload, insert, and email. Counting rejected
   * attempts would lock someone out of the form for an hour for mistyping.
   */
  const requestHeaders = await headers()
  if (!rateLimit(clientKey(requestHeaders, 'editor'), 3, 60 * 60 * 1000)) {
    return { ok: false, message: 'Too many applications from this address. Try again later.' }
  }

  const supabase = createSupabaseServiceClient()

  /*
   * The role is stored as text, so check it against the roles actually open
   * before trusting it. A title that is no longer recruited is the ordinary
   * case here, not an attack: someone leaves the form open while an editor
   * fills the post, or the appointment is made mid-application.
   */
  const { data: openRoles } = await supabase
    .from('editorial_roles')
    .select('title')
    .eq('status', 'recruiting')

  if (!openRoles?.some((role) => role.title === parsed.data.role)) {
    return {
      ok: false,
      message: 'Please check the highlighted fields.',
      fieldErrors: { role: 'That role is no longer open. Please choose another.' },
    }
  }

  const { error } = await supabase.from('editor_applications').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    affiliation: parsed.data.affiliation,
    position: parsed.data.position,
    role: parsed.data.role,
    statement: parsed.data.statement,
    experience: parsed.data.experience,
    orcid: parsed.data.orcid || null,
    status: 'new',
  })

  if (error) {
    console.error('[editor] insert failed:', error)
    return { ok: false, message: 'Something went wrong saving that. Please try again.' }
  }

  // The row is committed. Email is best effort from here.
  await notify(
    OFFICE_EMAIL,
    `Editorial board application: ${parsed.data.name}`,
    [
      `Name: ${parsed.data.name}`,
      `Email: ${parsed.data.email}`,
      `Institution: ${parsed.data.affiliation}`,
      `Position: ${parsed.data.position}`,
      `Role: ${parsed.data.role}`,
      parsed.data.orcid ? `ORCID: ${parsed.data.orcid}` : '',
      '',
      'Statement of interest:',
      parsed.data.statement,
      '',
      'Editorial experience:',
      parsed.data.experience || 'Not given.',
    ]
      .filter(Boolean)
      .join('\n'),
  )

  return {
    ok: true,
    message: 'Application received. The managing editor will be in touch about the next steps.',
  }
}

export async function sendContactMessage(
  _previous: FormResult | null,
  form: FormData,
): Promise<FormResult> {
  if (!isSupabaseConfigured()) return noDatabase('The contact form')

  const parsed = contactMessageSchema.safeParse({
    name: text(form, 'name'),
    email: text(form, 'email'),
    topic: text(form, 'topic'),
    message: text(form, 'message'),
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: 'Please check the highlighted fields.',
      fieldErrors: firstErrors(parsed.error.issues),
    }
  }

  /*
   * Rate limited here, after validation rather than before it. The limiter
   * guards the expensive path: upload, insert, and email. Counting rejected
   * attempts would lock someone out of the form for an hour for mistyping.
   */
  const requestHeaders = await headers()
  if (!rateLimit(clientKey(requestHeaders, 'contact'), 5, 60 * 60 * 1000)) {
    return { ok: false, message: 'Too many messages from this address. Try again later.' }
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
