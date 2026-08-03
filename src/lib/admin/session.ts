import 'server-only'

import { redirect } from 'next/navigation'
import { cache } from 'react'
import {
  can,
  withDefaults,
  type Area,
  type PermissionMatrix,
  type StaffRole,
} from '@/lib/admin/permissions'
import { adminPath } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export type AdminSession = {
  userId: string
  email: string
  name: string | null
  role: StaffRole
  /** True when the role came from BOOTSTRAP_ADMIN_EMAIL rather than the staff table. */
  isBootstrap: boolean
}

/**
 * The address that is an administrator whether or not the staff table says so.
 *
 * The panel's own permission grid is editable, and access needs a staff row, so
 * there are two ways to end up with a database that nobody can get into: a
 * first deploy where the table is still empty, and an administrator who edits
 * themselves out. This is the way back in, and it lives in the environment
 * rather than the database precisely so that no amount of editing inside the
 * panel can remove it.
 */
function bootstrapEmail(): string | null {
  const value = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase()
  return value ? value : null
}

/**
 * What each role may do, as stored.
 *
 * Read once per render. A database that cannot be reached falls back to the
 * built-in defaults rather than to an empty grid, because an empty grid would
 * read as "nobody may do anything" and lock the panel during an outage.
 */
export const permissionMatrix = cache(async (): Promise<PermissionMatrix> => {
  try {
    const supabase = createSupabaseServiceClient()
    const { data } = await supabase.from('role_permissions').select('role, area, level')

    const stored: Record<string, Record<string, string>> = {}
    for (const row of data ?? []) {
      stored[row.role] ??= {}
      stored[row.role][row.area] = row.level
    }

    return withDefaults(stored)
  } catch {
    return withDefaults(null)
  }
})

/**
 * The authenticated account, whatever the staff table says about it.
 *
 * `getUser` is a round trip to the auth server, not a cookie read, and every
 * admin view asks at least twice: the layout draws the sidebar, then the page
 * inside it gates itself. React's `cache` makes the second ask free without
 * weakening either check, because the scope is one render.
 *
 * Separate from `currentAdmin` because the two failures it distinguishes need
 * different answers: nobody is signed in, versus somebody is signed in and is
 * not staff.
 */
export const currentUser = cache(async () => {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
})

/**
 * Who is signed in, and what they are, or null.
 *
 * Authenticating is no longer enough. Without an active staff row, and without
 * being the bootstrap address, an account that can sign in still gets nothing.
 */
export const currentAdmin = cache(async (): Promise<AdminSession | null> => {
  const user = await currentUser()

  if (!user) return null

  const email = user.email ?? ''
  const bootstrap = bootstrapEmail()

  if (bootstrap && email.toLowerCase() === bootstrap) {
    return { userId: user.id, email, name: null, role: 'administrator', isBootstrap: true }
  }

  try {
    const service = createSupabaseServiceClient()
    const { data } = await service
      .from('staff')
      .select('role, name, is_active')
      .eq('user_id', user.id)
      .maybeSingle()

    // No row, or access revoked. Authenticated, but not staff.
    if (!data || !data.is_active) return null

    return {
      userId: user.id,
      email,
      name: data.name ?? null,
      role: data.role as StaffRole,
      isBootstrap: false,
    }
  } catch {
    /*
     * The staff lookup failed. Refuse rather than fall back to a role: an
     * unreachable database must not be a way to be treated as an administrator.
     * The bootstrap address above is checked before this and does not depend on
     * the database, so there is still a way in.
     */
    return null
  }
})

/**
 * Somebody with a seat in the panel, whatever their role.
 *
 * Use this only where any staff member belongs. Anything that shows or changes
 * something in particular wants `requireCapability` instead.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await currentAdmin()
  if (admin) return admin

  /*
   * Two different refusals, and sending both to the login page turns one of
   * them into a redirect loop: middleware bounces an already-signed-in visitor
   * off the login page and back into the panel, which refuses again, forever.
   * An account with no staff row gets a page that says so instead.
   */
  const user = await currentUser()
  redirect(user ? `/${adminPath()}/no-access` : `/${adminPath()}/login`)
}

/**
 * Every admin page and every admin server action calls this.
 *
 * Middleware gates the route tree on having a session at all, but it knows
 * nothing about roles, and a server action is reachable by direct POST no
 * matter what the navigation offers. Since the service-role client bypasses row
 * level security, this check is the only thing standing between a signed-in
 * reviewer and the site settings.
 *
 * Refusal redirects rather than throws, which for an action means the write
 * does not happen and the caller lands on a page that says why.
 */
export async function requireCapability(area: Area, need: 'view' | 'edit'): Promise<AdminSession> {
  const admin = await requireAdmin()
  const matrix = await permissionMatrix()

  if (!can(matrix, admin.role, area, need)) {
    redirect(`/${adminPath()}/denied?area=${encodeURIComponent(area)}`)
  }

  return admin
}
