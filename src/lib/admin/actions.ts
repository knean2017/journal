'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireCapability } from './session'
import { areaForEntity, areaForInbox } from './permissions'
import { friendlyError, reorder } from './derive'
import {
  INBOX_TABLES,
  SITE_CONFIG_FIELDS,
  WRITABLE_TABLES,
  findEntity,
  type Field,
  type InboxKey,
} from './entities'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { adminPath } from '@/lib/supabase/env'
import type { FormResult } from '@/lib/form-result'

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])
const DOC_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])
const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const MAX_DOC_BYTES = 20 * 1024 * 1024
/** Mirrors the inbox_status enum in migration 0003. */
const INBOX_STATUSES = new Set(['new', 'replied', 'archived'])

function assertWritable(table: string): void {
  if (!WRITABLE_TABLES.has(table)) throw new Error(`Refusing to write to table "${table}"`)
}

/**
 * The permission gate for the three actions that are generic over the entity.
 *
 * An entity with no area mapping is refused outright rather than allowed
 * through ungated, so adding an entity to ENTITIES and forgetting to place it
 * in AREA_BY_ENTITY locks it instead of opening it to everyone.
 */
async function requireEntityCapability(entitySlug: string, need: 'view' | 'edit') {
  const area = areaForEntity(entitySlug)
  if (!area) throw new Error(`No permission area is defined for "${entitySlug}"`)
  return requireCapability(area, need)
}

/** Turns raw form values into the types Postgres expects for each column. */
function coerce(fields: Field[], form: FormData): Record<string, unknown> {
  const row: Record<string, unknown> = {}

  for (const field of fields) {
    if (field.type === 'boolean') {
      row[field.name] = form.get(field.name) === 'on'
      continue
    }

    const raw = form.get(field.name)
    const value = typeof raw === 'string' ? raw.trim() : ''

    switch (field.type) {
      case 'image':
      case 'pdf':
        row[field.name] = value === '' ? null : value
        break
      case 'number':
        row[field.name] = value === '' ? null : Number(value)
        break
      case 'tags':
        row[field.name] = value
          ? value
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
          : []
        break
      case 'date':
      case 'discipline':
      case 'issue':
        row[field.name] = value === '' ? null : value
        break
      default:
        row[field.name] = value
    }
  }

  return row
}

/**
 * Saves and returns, rather than saving and throwing.
 *
 * A rejected save used to throw the Postgres message onto an error page, which
 * both told the editor nothing they could act on and threw away everything
 * they had typed. Now the message comes back to the form, which is still on
 * screen with its contents intact.
 */
export async function saveRecord(
  entitySlug: string,
  id: string | null,
  _previous: FormResult | null,
  form: FormData,
): Promise<FormResult> {
  await requireEntityCapability(entitySlug, 'edit')

  const entity = findEntity(entitySlug)
  if (!entity) throw new Error(`Unknown entity "${entitySlug}"`)
  assertWritable(entity.table)

  const supabase = createSupabaseServiceClient()
  const row = coerce(entity.fields, form)

  // Only one issue may be current, so setting it clears the rest first.
  if (entity.table === 'issues' && row.is_current === true) {
    const clear = supabase.from('issues').update({ is_current: false })
    await (id ? clear.neq('id', id) : clear.not('id', 'is', null))
  }

  const { error } = id
    ? await supabase.from(entity.table).update(row).eq('id', id)
    : await supabase.from(entity.table).insert(row)

  if (error) {
    console.error(`[admin] save to ${entity.table} failed:`, error)
    return { ok: false, message: friendlyError(error.message, entity.label.toLowerCase()) }
  }

  revalidatePath('/', 'layout')
  // Outside the failure path on purpose: redirect works by throwing.
  redirect(`/${adminPath()}/${entitySlug}`)
}

/**
 * Moves a row one place up or down its list.
 *
 * Writes the whole list back in sequence rather than swapping the pair, which
 * repairs duplicate and missing order numbers as a side effect. These lists run
 * to a handful of rows, so the extra writes cost nothing.
 */
export async function moveRecord(entitySlug: string, id: string, direction: 'up' | 'down') {
  await requireEntityCapability(entitySlug, 'edit')

  const entity = findEntity(entitySlug)
  if (!entity) throw new Error(`Unknown entity "${entitySlug}"`)
  assertWritable(entity.table)
  if (entity.orderBy.column !== 'sort_order') throw new Error(`${entity.plural} is not a sorted list`)

  const supabase = createSupabaseServiceClient()
  const { data } = await supabase
    .from(entity.table)
    .select('id, sort_order')
    .order('sort_order', { ascending: true })

  const rows = (data ?? []).map((row) => ({ id: String(row.id) }))
  const updated = reorder(rows, id, direction)

  for (const row of updated) {
    await supabase.from(entity.table).update({ sort_order: row.sort_order }).eq('id', row.id)
  }

  revalidatePath('/', 'layout')
  revalidatePath(`/${adminPath()}/${entitySlug}`)
}

export async function deleteRecord(entitySlug: string, id: string) {
  await requireEntityCapability(entitySlug, 'edit')

  const entity = findEntity(entitySlug)
  if (!entity) throw new Error(`Unknown entity "${entitySlug}"`)
  assertWritable(entity.table)

  const supabase = createSupabaseServiceClient()
  const { error } = await supabase.from(entity.table).delete().eq('id', id)
  if (error) throw new Error(friendlyError(error.message, entity.label.toLowerCase()))

  revalidatePath('/', 'layout')
  redirect(`/${adminPath()}/${entitySlug}`)
}

/*
 * The four deletes below cover everything the panel lists that the generic
 * record editor does not reach: the two inboxes, submissions, the announcement
 * list, and the record of what has been mailed. Each is gated on `edit` in the
 * same area as the page it appears on, so a role that may only read a list
 * cannot remove from it by posting to the action directly.
 *
 * All four revalidate and return rather than redirect, unlike `deleteRecord`.
 * They are pressed on a list rather than on a record's own page, so there is
 * nowhere to send anybody: the list they are already looking at is the answer,
 * one row shorter.
 */

/**
 * Takes an address off the list for good.
 *
 * Different from unsubscribing, which keeps the row and records the date. This
 * is for a row that should never have existed: a typo, a bounce, or somebody
 * who asked the office directly to be erased rather than merely unsubscribed.
 */
export async function deleteSubscriber(id: string): Promise<void> {
  await requireCapability('subscribers', 'edit')
  assertWritable('newsletter_subscribers')

  const supabase = createSupabaseServiceClient()
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id)
  if (error) throw new Error(friendlyError(error.message, 'address'))

  revalidatePath(`/${adminPath()}/subscribers`)
  revalidatePath(`/${adminPath()}/send`)
}

/** Removes one application or contact message. Keyed by inbox, never by table. */
export async function deleteInboxItem(key: InboxKey, id: string): Promise<void> {
  const area = areaForInbox(key)
  if (!area) throw new Error(`No permission area is defined for inbox "${key}"`)
  await requireCapability(area, 'edit')

  const inbox = INBOX_TABLES[key]
  if (!inbox) throw new Error(`Unknown inbox "${key}"`)
  assertWritable(inbox.table)

  const supabase = createSupabaseServiceClient()
  const { error } = await supabase.from(inbox.table).delete().eq('id', id)
  if (error) throw new Error(friendlyError(error.message, 'entry'))

  revalidatePath(`/${adminPath()}/${key}`)
  // The sidebar carries a count per inbox, so it goes stale otherwise.
  revalidatePath(`/${adminPath()}`, 'layout')
}

/**
 * Removes a submission and the files that came with it.
 *
 * The row goes first. If the storage removal fails afterwards the editor is
 * left with two orphaned objects in a private bucket, which is untidy; doing it
 * the other way round would leave a row pointing at files that are gone, which
 * is a submission that cannot be read and cannot be explained.
 */
export async function deleteSubmission(id: string): Promise<void> {
  await requireCapability('submissions', 'edit')
  assertWritable('submissions')

  const supabase = createSupabaseServiceClient()

  const { data: row } = await supabase
    .from('submissions')
    .select('manuscript_path, cover_letter_path')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase.from('submissions').delete().eq('id', id)
  if (error) throw new Error(friendlyError(error.message, 'submission'))

  const paths = [row?.manuscript_path, row?.cover_letter_path].filter(
    (path): path is string => typeof path === 'string' && path.length > 0,
  )

  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage.from('manuscripts').remove(paths)
    if (storageError) console.error('[admin] submission files left behind:', storageError)
  }

  revalidatePath(`/${adminPath()}/submissions`)
  revalidatePath(`/${adminPath()}`, 'layout')
}

/**
 * Removes one line from the record of what has been mailed.
 *
 * The send action refuses to mail an announcement that already has a row here,
 * whatever that row says, so this is also the release valve for the case that
 * guard warns about: a send recorded as started or stopped partway blocks the
 * announcement forever until somebody who has checked the mail provider clears
 * it. Deleting a completed send does not unsend it, and it does let the same
 * announcement go out to the whole list a second time.
 */
export async function deleteSend(id: string): Promise<void> {
  await requireCapability('announcement_sends', 'edit')
  assertWritable('announcement_sends')

  const supabase = createSupabaseServiceClient()
  const { error } = await supabase.from('announcement_sends').delete().eq('id', id)
  if (error) throw new Error(friendlyError(error.message, 'send'))

  revalidatePath(`/${adminPath()}/send`)
}

export async function saveSiteConfig(
  _previous: FormResult | null,
  form: FormData,
): Promise<FormResult> {
  await requireCapability('settings', 'edit')

  const supabase = createSupabaseServiceClient()
  const row = coerce(SITE_CONFIG_FIELDS, form)

  const { error } = await supabase
    .from('site_config')
    .upsert({ id: true, ...row }, { onConflict: 'id' })

  if (error) {
    console.error('[admin] site config save failed:', error)
    return { ok: false, message: friendlyError(error.message, 'setting') }
  }

  revalidatePath('/', 'layout')
  return { ok: true, message: 'Saved. The website is showing these values now.' }
}

/**
 * Uploads to a public bucket and returns the stored path.
 *
 * The filename is regenerated rather than taken from the client, and the MIME
 * type and size are checked server-side.
 */
export async function uploadAsset(form: FormData): Promise<string> {
  await requireCapability('media', 'edit')

  const file = form.get('file')
  const kind = form.get('kind')
  if (!(file instanceof File) || file.size === 0) throw new Error('No file supplied')

  const isPdf = kind === 'pdf'
  const allowed = isPdf ? DOC_TYPES : IMAGE_TYPES
  const maxBytes = isPdf ? MAX_DOC_BYTES : MAX_IMAGE_BYTES
  const bucket = isPdf ? 'article-pdfs' : 'media'

  if (!allowed.has(file.type)) throw new Error(`Unsupported file type: ${file.type}`)
  if (file.size > maxBytes) {
    throw new Error(`File is too large: ${Math.round(file.size / 1024 / 1024)} MB`)
  }

  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? 'bin'
  const path = `${crypto.randomUUID()}.${extension}`

  const supabase = createSupabaseServiceClient()
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  revalidatePath('/', 'layout')
  return path
}

export async function deleteAsset(bucket: string, path: string) {
  await requireCapability('media', 'edit')
  if (bucket !== 'media' && bucket !== 'article-pdfs') throw new Error('Unknown bucket')

  const supabase = createSupabaseServiceClient()
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw new Error(`Could not delete: ${error.message}`)

  revalidatePath('/', 'layout')
}

export async function setSubmissionStatus(id: string, status: string, notes: string) {
  await requireCapability('submissions', 'edit')

  const supabase = createSupabaseServiceClient()
  const { error } = await supabase
    .from('submissions')
    .update({ status, admin_notes: notes || null })
    .eq('id', id)

  if (error) throw new Error(`Could not update: ${error.message}`)
  revalidatePath(`/${adminPath()}/submissions`)
}

/**
 * Triage for the two public inboxes. The key names the inbox rather than the
 * table, so a caller can never aim this at an arbitrary table.
 */
export async function setInboxStatus(
  key: InboxKey,
  id: string,
  status: string,
  notes: string,
): Promise<void> {
  const area = areaForInbox(key)
  if (!area) throw new Error(`No permission area is defined for inbox "${key}"`)
  await requireCapability(area, 'edit')

  const inbox = INBOX_TABLES[key]
  if (!inbox) throw new Error(`Unknown inbox "${key}"`)
  assertWritable(inbox.table)

  if (!INBOX_STATUSES.has(status)) throw new Error(`Unknown status "${status}"`)

  const supabase = createSupabaseServiceClient()
  const { error } = await supabase
    .from(inbox.table)
    .update({ status, admin_notes: notes || null })
    .eq('id', id)

  if (error) throw new Error(`Could not update: ${error.message}`)
  revalidatePath(`/${adminPath()}/${key}`)
}

/**
 * Short-lived signed URL for one submitted file.
 *
 * Manuscripts and cover letters share the private bucket and are never public,
 * so both are read this way rather than by a URL anyone could keep.
 */
export async function signSubmissionFile(path: string): Promise<string> {
  // View, not edit: a reviewer reads manuscripts, and an observer may too.
  await requireCapability('submissions', 'view')

  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase.storage.from('manuscripts').createSignedUrl(path, 300)
  if (error || !data) throw new Error(`Could not sign: ${error?.message ?? 'unknown error'}`)

  return data.signedUrl
}

export async function signIn(
  _previous: { error: string } | null,
  form: FormData,
): Promise<{ error: string } | null> {
  const email = String(form.get('email') ?? '')
  const password = String(form.get('password') ?? '')

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  // Deliberately generic: never disclose whether the address exists.
  if (error) return { error: 'Those details were not accepted.' }

  redirect(`/${adminPath()}`)
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect(`/${adminPath()}/login`)
}
