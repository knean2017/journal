'use server'

import { revalidatePath } from 'next/cache'
import {
  ACCESS_LEVELS,
  AREAS,
  STAFF_ROLES,
  type AccessLevel,
  type Area,
  type StaffRole,
} from './permissions'
import { requireCapability } from './session'
import { adminPath } from '@/lib/supabase/env'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import type { FormResult } from '@/lib/form-result'

export type StaffMember = {
  userId: string
  email: string
  name: string | null
  role: StaffRole
  isActive: boolean
  createdAt: string
}

/** An invite carries a link back when the email could not be sent. */
export type InviteResult = FormResult & { link?: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isRole(value: unknown): value is StaffRole {
  return typeof value === 'string' && (STAFF_ROLES as readonly string[]).includes(value)
}

/**
 * Everyone with a seat, most recently added first.
 *
 * Read straight from `staff` rather than from the auth schema: a person who has
 * been invited but has not yet set a password still has a row here, and should
 * appear in the list as pending rather than vanish until they sign in.
 */
export async function listStaff(): Promise<StaffMember[]> {
  await requireCapability('people', 'view')

  const supabase = createSupabaseServiceClient()
  const { data } = await supabase
    .from('staff')
    .select('user_id, email, name, role, is_active, created_at')
    .order('created_at', { ascending: false })

  return (data ?? []).map((row) => ({
    userId: row.user_id,
    email: row.email,
    name: row.name,
    role: row.role as StaffRole,
    isActive: row.is_active,
    createdAt: row.created_at,
  }))
}

/**
 * How many administrators could still get in.
 *
 * Used before anything that could reduce that number. The bootstrap address is
 * a way back in and is deliberately not counted here: it is the recovery hatch,
 * not a seat, and treating it as one would let the panel talk somebody into
 * removing their last real administrator.
 */
async function activeAdministrators(): Promise<number> {
  const supabase = createSupabaseServiceClient()
  const { count } = await supabase
    .from('staff')
    .select('user_id', { count: 'exact', head: true })
    .eq('role', 'administrator')
    .eq('is_active', true)

  return count ?? 0
}

/**
 * Invites somebody and gives them a role.
 *
 * Supabase's built-in mail is rate limited on the free tier and this journal
 * adds no paid services, so a failure to send is expected rather than
 * exceptional. When it happens the account is still created and a one-time link
 * comes back for the administrator to pass on by hand.
 */
export async function invitePerson(
  _previous: InviteResult | null,
  form: FormData,
): Promise<InviteResult> {
  await requireCapability('people', 'edit')

  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase()
  const name = String(form.get('name') ?? '').trim()
  const role = String(form.get('role') ?? '')

  if (!EMAIL.test(email)) {
    return { ok: false, message: 'Check the address.', fieldErrors: { email: 'Not an email address.' } }
  }

  if (!isRole(role)) {
    return { ok: false, message: 'Check the role.', fieldErrors: { role: 'Pick a role.' } }
  }

  const supabase = createSupabaseServiceClient()

  const { data: existing } = await supabase
    .from('staff')
    .select('user_id')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    return {
      ok: false,
      message: 'That person already has a seat.',
      fieldErrors: { email: 'Already invited. Change their role in the list below.' },
    }
  }

  const invited = await supabase.auth.admin.inviteUserByEmail(email)
  let userId = invited.data?.user?.id ?? null
  let link: string | undefined

  if (!userId) {
    /*
     * Either the mail failed or the auth account already exists from an earlier
     * invite that never produced a staff row. A generated link covers both: it
     * creates the account if it is missing and returns something sendable.
     */
    const generated = await supabase.auth.admin.generateLink({ type: 'invite', email })

    userId = generated.data?.user?.id ?? null
    link = generated.data?.properties?.action_link

    if (!userId) {
      console.error('[admin] invite failed:', invited.error ?? generated.error)
      return {
        ok: false,
        message: `Could not invite them. ${invited.error?.message ?? generated.error?.message ?? ''}`.trim(),
      }
    }
  }

  const { error } = await supabase.from('staff').insert({
    user_id: userId,
    email,
    name: name || null,
    role,
    is_active: true,
  })

  if (error) {
    console.error('[admin] staff insert failed:', error)
    return { ok: false, message: `Invited, but the seat was not saved. ${error.message}` }
  }

  revalidatePath(`/${adminPath()}/people`)

  return link
    ? {
        ok: true,
        message: 'Account created, but the email could not be sent. Copy the link below to them.',
        link,
      }
    : { ok: true, message: `Invited ${email}. They will get an email to set a password.` }
}

/** Changes what somebody is. Never yourself, and never the last administrator. */
export async function setPersonRole(userId: string, role: string): Promise<void> {
  const admin = await requireCapability('people', 'edit')

  if (!isRole(role)) throw new Error(`Unknown role "${role}"`)

  /*
   * Changing your own role is refused outright rather than checked carefully.
   * It is the shortest path to locking yourself out, it is never something you
   * need to do to yourself, and refusing it removes a whole class of edge case.
   */
  if (userId === admin.userId) {
    throw new Error('You cannot change your own role. Ask another administrator.')
  }

  const supabase = createSupabaseServiceClient()
  const { data: target } = await supabase
    .from('staff')
    .select('role, is_active')
    .eq('user_id', userId)
    .maybeSingle()

  if (!target) throw new Error('That person no longer has a seat.')

  if (
    target.role === 'administrator' &&
    target.is_active &&
    role !== 'administrator' &&
    (await activeAdministrators()) <= 1
  ) {
    throw new Error('That is the last administrator. Promote somebody else first.')
  }

  const { error } = await supabase.from('staff').update({ role }).eq('user_id', userId)
  if (error) throw new Error(`Could not change the role: ${error.message}`)

  revalidatePath(`/${adminPath()}/people`)
}

/** Turns access on or off without losing the record that they had it. */
export async function setPersonActive(userId: string, isActive: boolean): Promise<void> {
  const admin = await requireCapability('people', 'edit')

  if (userId === admin.userId) {
    throw new Error('You cannot remove your own access. Ask another administrator.')
  }

  const supabase = createSupabaseServiceClient()

  if (!isActive) {
    const { data: target } = await supabase
      .from('staff')
      .select('role, is_active')
      .eq('user_id', userId)
      .maybeSingle()

    if (
      target?.role === 'administrator' &&
      target.is_active &&
      (await activeAdministrators()) <= 1
    ) {
      throw new Error('That is the last administrator. Promote somebody else first.')
    }
  }

  const { error } = await supabase
    .from('staff')
    .update({ is_active: isActive })
    .eq('user_id', userId)

  if (error) throw new Error(`Could not update access: ${error.message}`)

  revalidatePath(`/${adminPath()}/people`)
}

/**
 * Saves the grid.
 *
 * The administrator row is skipped rather than validated. `levelFor` answers
 * 'edit' for that role without consulting the table, so writing those rows
 * would be writing values nothing reads, and leaving them alone keeps the
 * stored grid honest about what is actually in force.
 */
export async function savePermissions(
  _previous: FormResult | null,
  form: FormData,
): Promise<FormResult> {
  await requireCapability('people', 'edit')

  const rows: { role: StaffRole; area: Area; level: AccessLevel }[] = []

  for (const role of STAFF_ROLES) {
    if (role === 'administrator') continue

    for (const area of AREAS) {
      const raw = String(form.get(`level:${role}:${area}`) ?? '')
      if (!(ACCESS_LEVELS as readonly string[]).includes(raw)) continue
      rows.push({ role, area, level: raw as AccessLevel })
    }
  }

  if (rows.length === 0) return { ok: false, message: 'Nothing to save.' }

  const supabase = createSupabaseServiceClient()
  const { error } = await supabase.from('role_permissions').upsert(rows, { onConflict: 'role,area' })

  if (error) {
    console.error('[admin] permissions save failed:', error)
    return { ok: false, message: `Could not save: ${error.message}` }
  }

  revalidatePath('/', 'layout')
  return { ok: true, message: 'Saved. Everyone sees this the next time they load a page.' }
}
