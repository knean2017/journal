import 'server-only'

import { redirect } from 'next/navigation'
import { cache } from 'react'
import { adminPath } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Who is signed in, or null.
 *
 * `getUser` is a round trip to the auth server, not a cookie read, and every
 * admin view asks at least twice: the layout draws the sidebar for a signed-in
 * editor, then the page inside it calls `requireAdmin`. React's `cache` makes
 * the second ask free without weakening either check, because the scope is one
 * render.
 */
export const currentAdmin = cache(async (): Promise<{ email: string } | null> => {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user ? { email: user.email ?? '' } : null
})

/**
 * Every admin page and every admin server action calls this.
 *
 * Middleware already gates the route tree, but a server action is reachable by
 * direct POST, so the check has to happen here too.
 */
export async function requireAdmin(): Promise<{ email: string }> {
  const admin = await currentAdmin()
  if (!admin) redirect(`/${adminPath()}/login`)
  return admin
}
