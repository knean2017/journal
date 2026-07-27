'use server'

import { headers } from 'next/headers'
import { MAX_MANUSCRIPT_BYTES, manuscriptExtension } from './manuscript'
import { manuscriptPathSchema, newsletterSchema, submissionSchema } from './schema'
import { notify } from '@/lib/email/resend'
import { firstErrors, text, type FormResult, type UploadTarget } from '@/lib/form-result'
import { clientKey, rateLimit } from '@/lib/rate-limit'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { SUBMIT_TOAST, SUBSCRIBE_TOAST } from '@/lib/toasts'

const OFFICE_EMAIL = process.env.EDITORIAL_EMAIL ?? 'icrrjournal@gmail.com'

/*
 * A manuscript is submitted in two halves, because it does not fit through a
 * Server Action. Next caps a Server Action body at 1 MB, and raising that only
 * moves the wall: the deploy target runs these actions as functions with a
 * request payload limit of a few megabytes. Neither can carry 20 MB.
 *
 * So the file never passes through the server. `createManuscriptUpload` checks
 * the form and hands back a one-time credential for a single storage path;
 * the browser uploads to storage directly; `submitManuscript` is then given
 * the path and records the row. Both halves validate the same fields, because
 * the second one is reachable on its own.
 */

/** The text half of the form. Shared, so the two halves cannot disagree. */
function parseSubmission(form: FormData) {
  return submissionSchema.safeParse({
    correspondingAuthor: text(form, 'author'),
    email: text(form, 'email'),
    institution: text(form, 'institution'),
    section: text(form, 'section'),
    title: text(form, 'title'),
    abstract: text(form, 'abstract'),
    originality: form.get('originality') === 'on',
  })
}

const checkTheFields = (
  issues: readonly { path: readonly PropertyKey[]; message: string }[],
): FormResult => ({
  ok: false,
  message: 'Please check the highlighted fields.',
  fieldErrors: firstErrors(issues),
})

/**
 * Validates the form and issues a signed upload URL for one storage path.
 *
 * The form is checked before the credential is issued, so a mistyped email
 * costs nothing: nobody uploads 20 MB only to be told the address is wrong.
 */
export async function createManuscriptUpload(
  _previous: UploadTarget | null,
  form: FormData,
): Promise<UploadTarget> {
  // No database attached yet: keep the honest pre-launch message.
  if (!isSupabaseConfigured()) return { ok: false, message: SUBMIT_TOAST }

  const parsed = parseSubmission(form)
  if (!parsed.success) return checkTheFields(parsed.error.issues)

  const extension = manuscriptExtension(text(form, 'manuscriptName'), text(form, 'manuscriptType'))
  if (!extension) {
    return {
      ok: false,
      message: 'The manuscript must be a PDF or DOCX file.',
      fieldErrors: { manuscript: 'Only PDF and DOCX files are accepted.' },
    }
  }

  const size = Number(form.get('manuscriptSize'))
  if (!Number.isFinite(size) || size <= 0) {
    return {
      ok: false,
      message: 'Please attach the anonymised manuscript.',
      fieldErrors: { manuscript: 'A PDF or DOCX file is required.' },
    }
  }
  if (size > MAX_MANUSCRIPT_BYTES) {
    return {
      ok: false,
      message: 'That file is larger than 20 MB.',
      fieldErrors: { manuscript: 'Please attach a file under 20 MB.' },
    }
  }

  /*
   * Rate limited here, after validation rather than before it. The limiter
   * guards the expensive path: upload, insert, and email. Counting rejected
   * attempts would lock someone out of the form for an hour for mistyping.
   *
   * This is the only limiter on the pair. It sits in the half that mints
   * storage credentials, which is the half worth guarding.
   */
  const requestHeaders = await headers()
  if (!rateLimit(clientKey(requestHeaders, 'submit'), 5, 60 * 60 * 1000)) {
    return { ok: false, message: 'Too many submissions from this address. Try again later.' }
  }

  // The path is generated here; the client's filename is never trusted.
  const path = `${crypto.randomUUID()}.${extension}`
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase.storage.from('manuscripts').createSignedUploadUrl(path)

  if (error || !data) {
    console.error('[submit] could not sign an upload URL:', error)
    return { ok: false, message: 'Could not start the upload. Please try again.' }
  }

  return { ok: true, message: '', upload: { path: data.path, token: data.token } }
}

export async function submitManuscript(
  _previous: FormResult | null,
  form: FormData,
): Promise<FormResult> {
  // No database attached yet: keep the honest pre-launch message.
  if (!isSupabaseConfigured()) return { ok: false, message: SUBMIT_TOAST }

  const parsed = parseSubmission(form)
  if (!parsed.success) return checkTheFields(parsed.error.issues)

  const parsedPath = manuscriptPathSchema.safeParse(form.get('manuscriptPath'))
  if (!parsedPath.success) {
    return {
      ok: false,
      message: 'Please attach the anonymised manuscript.',
      fieldErrors: { manuscript: parsedPath.error.issues[0]?.message ?? 'A file is required.' },
    }
  }

  const path = parsedPath.data
  const supabase = createSupabaseServiceClient()

  /*
   * The upload happened in the browser, so its result is a claim until it is
   * checked here: the object has to exist, and it has to be the size it was
   * signed for.
   */
  const listed = await supabase.storage.from('manuscripts').list('', { search: path, limit: 1 })
  const object = listed.data?.find((entry) => entry.name === path)
  const uploadedBytes = Number(object?.metadata?.size ?? 0)

  if (!object || uploadedBytes <= 0) {
    return {
      ok: false,
      message: 'The upload did not finish. Please attach the file and try again.',
      fieldErrors: { manuscript: 'The file did not reach us.' },
    }
  }
  if (uploadedBytes > MAX_MANUSCRIPT_BYTES) {
    await supabase.storage.from('manuscripts').remove([path])
    return {
      ok: false,
      message: 'That file is larger than 20 MB.',
      fieldErrors: { manuscript: 'Please attach a file under 20 MB.' },
    }
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

  const parsed = newsletterSchema.safeParse({ email: text(form, 'email') })
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'That email looks wrong.' }
  }

  /*
   * Rate limited here, after validation rather than before it. The limiter
   * guards the expensive path: upload, insert, and email. Counting rejected
   * attempts would lock someone out of the form for an hour for mistyping.
   */
  const requestHeaders = await headers()
  if (!rateLimit(clientKey(requestHeaders, 'subscribe'), 10, 60 * 60 * 1000)) {
    return { ok: false, message: 'Too many attempts from this address. Try again later.' }
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
