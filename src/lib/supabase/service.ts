import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, serviceRoleKey } from './env'

/**
 * Service-role client. Bypasses RLS entirely, so it is the only way anything
 * gets written.
 *
 * The `server-only` import above makes importing this from a client component
 * a build error rather than a credential leak.
 */
export function createSupabaseServiceClient() {
  return createClient(SUPABASE_URL, serviceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
