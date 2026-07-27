import 'server-only'

import { redirect } from 'next/navigation'
import { adminPath } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Every admin page and every admin server action calls this.
 *
 * Middleware already gates the route tree, but a server action is reachable by
 * direct POST, so the check has to happen here too.
 */
export async function requireAdmin(): Promise<{ email: string }> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/${adminPath()}/login`)

  return { email: user.email ?? '' }
}
