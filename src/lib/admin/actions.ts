'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from './session'
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
      case 'richtext':
        row[field.name] = value ? JSON.parse(value) : null
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

export async function saveRecord(entitySlug: string, id: string | null, form: FormData) {
  await requireAdmin()

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

  if (error) throw new Error(`Could not save: ${error.message}`)

  revalidatePath('/', 'layout')
  redirect(`/${adminPath()}/${entitySlug}`)
}

export async function deleteRecord(entitySlug: string, id: string) {
  await requireAdmin()

  const entity = findEntity(entitySlug)
  if (!entity) throw new Error(`Unknown entity "${entitySlug}"`)
  assertWritable(entity.table)

  const supabase = createSupabaseServiceClient()
  const { error } = await supabase.from(entity.table).delete().eq('id', id)
  if (error) throw new Error(`Could not delete: ${error.message}`)

  revalidatePath('/', 'layout')
  redirect(`/${adminPath()}/${entitySlug}`)
}

export async function saveSiteConfig(form: FormData) {
  await requireAdmin()

  const supabase = createSupabaseServiceClient()
  const row = coerce(SITE_CONFIG_FIELDS, form)

  const { error } = await supabase
    .from('site_config')
    .upsert({ id: true, ...row }, { onConflict: 'id' })

  if (error) throw new Error(`Could not save: ${error.message}`)

  revalidatePath('/', 'layout')
  redirect(`/${adminPath()}/config`)
}

/**
 * Uploads to a public bucket and returns the stored path.
 *
 * The filename is regenerated rather than taken from the client, and the MIME
 * type and size are checked server-side.
 */
export async function uploadAsset(form: FormData): Promise<string> {
  await requireAdmin()

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
  await requireAdmin()
  if (bucket !== 'media' && bucket !== 'article-pdfs') throw new Error('Unknown bucket')

  const supabase = createSupabaseServiceClient()
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw new Error(`Could not delete: ${error.message}`)

  revalidatePath('/', 'layout')
}

export async function setSubmissionStatus(id: string, status: string, notes: string) {
  await requireAdmin()

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
  await requireAdmin()

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

/** Short-lived signed URL. Manuscripts are never public. */
export async function signManuscript(path: string): Promise<string> {
  await requireAdmin()

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
