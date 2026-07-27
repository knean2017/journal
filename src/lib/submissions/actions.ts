'use server'

import { headers } from 'next/headers'
import { MANUSCRIPT_TYPES, MAX_MANUSCRIPT_BYTES, newsletterSchema, submissionSchema } from './schema'
import { notify } from '@/lib/email/resend'
import { firstErrors, type FormResult } from '@/lib/form-result'
import { clientKey, rateLimit } from '@/lib/rate-limit'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { SUBMIT_TOAST, SUBSCRIBE_TOAST } from '@/lib/toasts'

const OFFICE_EMAIL = process.env.EDITORIAL_EMAIL ?? 'icrrjournal@gmail.com'

export async function submitManuscript(
  _previous: FormResult | null,
  form: FormData,
): Promise<FormResult> {
  // No database attached yet: keep the honest pre-launch message.
  if (!isSupabaseConfigured()) return { ok: false, message: SUBMIT_TOAST }

  const requestHeaders = await headers()
  if (!rateLimit(clientKey(requestHeaders, 'submit'), 5, 60 * 60 * 1000)) {
    return { ok: false, message: 'Too many submissions from this address. Try again later.' }
  }

  const parsed = submissionSchema.safeParse({
    correspondingAuthor: form.get('author'),
    email: form.get('email'),
    institution: form.get('institution'),
    section: form.get('section'),
    title: form.get('title'),
    abstract: form.get('abstract'),
    originality: form.get('originality') === 'on',
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: 'Please check the highlighted fields.',
      fieldErrors: firstErrors(parsed.error.issues),
    }
  }

  const file = form.get('manuscript')
  if (!(file instanceof File) || file.size === 0) {
    return {
      ok: false,
      message: 'Please attach the anonymised manuscript.',
      fieldErrors: { manuscript: 'A PDF or DOCX file is required.' },
    }
  }
  if (!MANUSCRIPT_TYPES.has(file.type)) {
    return { ok: false, message: 'The manuscript must be a PDF or DOCX file.' }
  }
  if (file.size > MAX_MANUSCRIPT_BYTES) {
    return { ok: false, message: 'That file is larger than 20 MB.' }
  }

  const supabase = createSupabaseServiceClient()

  // Filename is regenerated; the client's name is never trusted.
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? 'bin'
  const path = `${crypto.randomUUID()}.${extension}`

  const upload = await supabase.storage
    .from('manuscripts')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (upload.error) {
    console.error('[submit] manuscript upload failed:', upload.error)
    return { ok: false, message: 'The upload failed. Please try again.' }
  }

  const { data: discipline } = await supabase
    .from('disciplines')
    .select('id, name')
    .eq('slug', parsed.data.section)
    .maybeSingle()

  const insert = await supabase.from('submissions').insert({
    corresponding_author: parsed.data.correspondingAuthor,
    email: parsed.data.email,
    institution: parsed.data.institution,
    discipline_id: discipline?.id ?? null,
    title: parsed.data.title,
    abstract: parsed.data.abstract,
    manuscript_path: path,
    originality_confirmed: true,
    status: 'new',
  })

  if (insert.error) {
    console.error('[submit] insert failed:', insert.error)
    await supabase.storage.from('manuscripts').remove([path])
    return { ok: false, message: 'Something went wrong saving your submission. Please try again.' }
  }

  // The row is committed. Email is best effort from here.
  await notify(
    OFFICE_EMAIL,
    `New submission: ${parsed.data.title}`,
    [
      `Title: ${parsed.data.title}`,
      `Author: ${parsed.data.correspondingAuthor}`,
      `Email: ${parsed.data.email}`,
      `Institution: ${parsed.data.institution}`,
      `Section: ${discipline?.name ?? parsed.data.section}`,
      '',
      'Abstract:',
      parsed.data.abstract,
      '',
      'Open the editorial office to read the manuscript.',
    ].join('\n'),
  )

  return {
    ok: true,
    message:
      'Submission received. You will hear from the editorial office once it has been screened.',
  }
}

export async function subscribe(
  _previous: FormResult | null,
  form: FormData,
): Promise<FormResult> {
  if (!isSupabaseConfigured()) return { ok: true, message: SUBSCRIBE_TOAST }

  const requestHeaders = await headers()
  if (!rateLimit(clientKey(requestHeaders, 'subscribe'), 10, 60 * 60 * 1000)) {
    return { ok: false, message: 'Too many attempts from this address. Try again later.' }
  }

  const parsed = newsletterSchema.safeParse({ email: form.get('email') })
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'That email looks wrong.' }
  }

  const supabase = createSupabaseServiceClient()
  // Upsert, so signing up twice is not an error.
  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email: parsed.data.email, is_active: true }, { onConflict: 'email' })

  if (error) {
    console.error('[subscribe] failed:', error)
    return { ok: false, message: 'Could not save that address. Please try again.' }
  }

  return { ok: true, message: SUBSCRIBE_TOAST }
}
