'use server'

import { headers } from 'next/headers'
import { MAX_COVER_LETTER_BYTES, MAX_MANUSCRIPT_BYTES, manuscriptExtension } from './manuscript'
import { newsletterSchema, submissionSchema, uploadPathSchema } from './schema'
import { notify } from '@/lib/email/resend'
import {
  firstErrors,
  text,
  type FormResult,
  type SignedUpload,
  type UploadTarget,
} from '@/lib/form-result'
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
 * So the files never pass through the server. `createSubmissionUploads` checks
 * the form and hands back a one-time credential per storage path; the browser
 * uploads to storage directly; `submitManuscript` is then given the paths and
 * records the row. Both halves validate the same fields, because the second
 * one is reachable on its own.
 *
 * A submission is two files: the anonymised manuscript, and the cover letter
 * that carries the names the manuscript may not. Both are demanded here
 * because the site asks for both in three places, and a form that accepted one
 * of them would be the odd one out.
 */

/** What a file has to be to be accepted, per role in the submission. */
const ATTACHMENTS = [
  {
    field: 'manuscript',
    limit: MAX_MANUSCRIPT_BYTES,
    missing: 'Please attach the anonymised manuscript.',
    tooBig: 'That manuscript is larger than 20 MB.',
    tooBigField: 'Please attach a file under 20 MB.',
  },
  {
    field: 'coverLetter',
    limit: MAX_COVER_LETTER_BYTES,
    missing: 'Please attach the cover letter.',
    tooBig: 'That cover letter is larger than 5 MB.',
    tooBigField: 'Please attach a file under 5 MB.',
  },
] as const

/**
 * The extension to store one attachment under, or the reason it is refused.
 *
 * The browser describes each file rather than sending it, so this reads the
 * name, type and size the form reported. They are a claim, which is why
 * `submitManuscript` measures the object that actually arrived.
 */
function checkAttachment(
  form: FormData,
  attachment: (typeof ATTACHMENTS)[number],
): { extension: string } | FormResult {
  const { field, limit, missing, tooBig, tooBigField } = attachment

  const extension = manuscriptExtension(text(form, `${field}Name`), text(form, `${field}Type`))
  if (!extension) {
    return {
      ok: false,
      message: 'Both files must be PDF or DOCX.',
      fieldErrors: { [field]: 'Only PDF and DOCX files are accepted.' },
    }
  }

  const size = Number(form.get(`${field}Size`))
  if (!Number.isFinite(size) || size <= 0) {
    return { ok: false, message: missing, fieldErrors: { [field]: 'A PDF or DOCX file is required.' } }
  }
  if (size > limit) {
    return { ok: false, message: tooBig, fieldErrors: { [field]: tooBigField } }
  }

  return { extension }
}

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
 * Validates the form and issues a signed upload URL per storage path.
 *
 * The form is checked before either credential is issued, so a mistyped email
 * costs nothing: nobody uploads 20 MB only to be told the address is wrong.
 * Both files are checked before either is signed, for the same reason.
 */
export async function createSubmissionUploads(
  _previous: UploadTarget | null,
  form: FormData,
): Promise<UploadTarget> {
  // No database attached yet: keep the honest pre-launch message.
  if (!isSupabaseConfigured()) return { ok: false, message: SUBMIT_TOAST }

  const parsed = parseSubmission(form)
  if (!parsed.success) return checkTheFields(parsed.error.issues)

  const extensions: string[] = []
  for (const attachment of ATTACHMENTS) {
    const checked = checkAttachment(form, attachment)
    if ('ok' in checked) return checked
    extensions.push(checked.extension)
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

  const supabase = createSupabaseServiceClient()
  const signed: SignedUpload[] = []

  for (const extension of extensions) {
    // The path is generated here; the client's filename is never trusted.
    const path = `${crypto.randomUUID()}.${extension}`
    const { data, error } = await supabase.storage.from('manuscripts').createSignedUploadUrl(path)

    if (error || !data) {
      console.error('[submit] could not sign an upload URL:', error)
      return { ok: false, message: 'Could not start the upload. Please try again.' }
    }
    signed.push({ path: data.path, token: data.token })
  }

  return {
    ok: true,
    message: '',
    uploads: { manuscript: signed[0], coverLetter: signed[1] },
  }
}

export async function submitManuscript(
  _previous: FormResult | null,
  form: FormData,
): Promise<FormResult> {
  // No database attached yet: keep the honest pre-launch message.
  if (!isSupabaseConfigured()) return { ok: false, message: SUBMIT_TOAST }

  const parsed = parseSubmission(form)
  if (!parsed.success) return checkTheFields(parsed.error.issues)

  const paths: string[] = []
  for (const attachment of ATTACHMENTS) {
    const parsedPath = uploadPathSchema.safeParse(form.get(`${attachment.field}Path`))
    if (!parsedPath.success) {
      return {
        ok: false,
        message: attachment.missing,
        fieldErrors: {
          [attachment.field]: parsedPath.error.issues[0]?.message ?? 'A file is required.',
        },
      }
    }
    paths.push(parsedPath.data)
  }

  const supabase = createSupabaseServiceClient()

  /*
   * Both uploads happened in the browser, so their results are a claim until
   * they are checked here: each object has to exist, and it has to be within
   * the ceiling it was signed for.
   *
   * A file already accepted is removed when its partner turns out to be
   * missing. Nothing has been recorded at this point, so leaving it would
   * leave an object in the bucket that no row will ever refer to.
   */
  const discard = () => supabase.storage.from('manuscripts').remove(paths)

  for (const [index, attachment] of ATTACHMENTS.entries()) {
    const path = paths[index]
    const listed = await supabase.storage.from('manuscripts').list('', { search: path, limit: 1 })
    const object = listed.data?.find((entry) => entry.name === path)
    const uploadedBytes = Number(object?.metadata?.size ?? 0)

    if (!object || uploadedBytes <= 0) {
      await discard()
      return {
        ok: false,
        message: 'The upload did not finish. Please attach both files and try again.',
        fieldErrors: { [attachment.field]: 'The file did not reach us.' },
      }
    }
    if (uploadedBytes > attachment.limit) {
      await discard()
      return {
        ok: false,
        message: attachment.tooBig,
        fieldErrors: { [attachment.field]: attachment.tooBigField },
      }
    }
  }

  const [manuscriptPath, coverLetterPath] = paths

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
    manuscript_path: manuscriptPath,
    cover_letter_path: coverLetterPath,
    originality_confirmed: true,
    status: 'new',
  })

  if (insert.error) {
    console.error('[submit] insert failed:', insert.error)
    await discard()
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
      'Open the editorial office to read the manuscript and the cover letter.',
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
